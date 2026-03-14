import type { APIRoute } from 'astro';
import { extractPageText } from '../../lib/extract-web-server';

export const prerender = false;

const DEFAULT_MAX_PAGES = 20;
const MAX_TOTAL_LENGTH = 200000;
const SITEMAP_TIMEOUT = 20000;

function isSitemapUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('sitemap') && (lower.endsWith('.xml') || lower.includes('.xml'));
}

function getSitemapCandidates(baseUrl: string): string[] {
  try {
    const origin = new URL(baseUrl).origin;
    return [
      `${origin}/sitemap.xml`,
      `${origin}/sitemap_index.xml`,
      `${origin}/sitemap-index.xml`,
      `${origin}/sitemap/index.xml`,
    ];
  } catch {
    return [];
  }
}

export const POST: APIRoute = async ({ request }) => {
  let url: string;
  let maxPages: number = DEFAULT_MAX_PAGES;
  try {
    const body = await request.json().catch(() => ({}));
    url = typeof body?.url === 'string' ? body.url.trim() : '';
    if (typeof body?.maxPages === 'number' && body.maxPages > 0 && body.maxPages <= 50) {
      maxPages = Math.floor(body.maxPages);
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido. Envía { "url": "https://..." }' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'Falta la URL (página principal o sitemap.xml)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return new Response(
      JSON.stringify({ error: 'URL debe empezar por http:// o https://' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let sitemapUrl: string;
  if (isSitemapUrl(url)) {
    sitemapUrl = url;
  } else {
    const candidates = getSitemapCandidates(url);
    let found = false;
    for (const candidate of candidates) {
      try {
        const res = await fetch(candidate, { method: 'HEAD', redirect: 'follow' });
        if (res.ok) {
          sitemapUrl = candidate;
          found = true;
          break;
        }
      } catch {
        //
      }
    }
    if (!found) {
      sitemapUrl = candidates[0];
    }
  }

  try {
    const Sitemapper = (await import('sitemapper')).default;
    const sitemap = new Sitemapper({ timeout: SITEMAP_TIMEOUT });
    const { sites } = await sitemap.fetch(sitemapUrl);
    if (!sites?.length) {
      return new Response(
        JSON.stringify({
          error: 'No se encontraron URLs en el sitemap. Verifica la URL o usa "Extraer de Página Web" para una sola página.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const toFetch = sites.slice(0, maxPages);
    const parts: string[] = [];
    let totalLen = 0;

    for (const pageUrl of toFetch) {
      if (totalLen >= MAX_TOTAL_LENGTH) break;
      try {
        const text = await extractPageText(pageUrl);
        if (text) {
          const block = `--- ${pageUrl} ---\n\n${text}`;
          const take = Math.min(block.length, MAX_TOTAL_LENGTH - totalLen);
          parts.push(block.slice(0, take));
          totalLen += take;
        }
      } catch {
        // omitir página que falle
      }
    }

    if (parts.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No se pudo extraer contenido de ninguna página. Prueba con menos páginas o otra web.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const content = `Sitio completo (${parts.length} páginas):\n\n${parts.join('\n\n')}`;
    return new Response(
      JSON.stringify({ content, pagesUsed: parts.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        error: `Error al leer el sitemap o las páginas: ${message}. Prueba con la URL de tu página principal (ej. https://tuempresa.com) o con la URL directa del sitemap (sitemap.xml).`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
