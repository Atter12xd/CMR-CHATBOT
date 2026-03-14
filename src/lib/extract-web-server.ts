/**
 * Extracción de texto desde una URL en el servidor (sin CORS).
 * Usa Readability para contenido principal cuando está disponible; si no, stripHtml.
 */

const TIMEOUT_MS = 15000;
const MAX_LENGTH = 50000;

function stripHtml(html: string): string {
  const withoutScripts = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  return withoutScripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractWithReadability(html: string, pageUrl: string): Promise<string | null> {
  try {
    const { JSDOM } = await import('jsdom');
    const { Readability } = await import('@mozilla/readability');
    const dom = new JSDOM(html, { url: pageUrl });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (article?.textContent && article.textContent.trim().length > 100) {
      return article.textContent.trim();
    }
  } catch {
    // Readability/JSDOM fallan en algunas páginas
  }
  return null;
}

export async function extractPageText(pageUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const res = await fetch(pageUrl, {
    signal: controller.signal,
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (compatible; BotCrawl/1.0)',
    },
    redirect: 'follow',
  });
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`No se pudo acceder: ${res.status}`);
  }

  const html = await res.text();
  const readable = await extractWithReadability(html, pageUrl);
  const text = readable ?? stripHtml(html);

  if (!text || text.length < 30) {
    return '';
  }
  return text.slice(0, MAX_LENGTH);
}
