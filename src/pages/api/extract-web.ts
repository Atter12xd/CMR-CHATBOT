import type { APIRoute } from 'astro';
import { extractPageText } from '../../lib/extract-web-server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let url: string;
  try {
    const body = await request.json();
    url = typeof body?.url === 'string' ? body.url.trim() : '';
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido. Envía { "url": "https://..." }' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'Falta la URL' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return new Response(
      JSON.stringify({ error: 'URL debe empezar por http:// o https://' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const text = await extractPageText(url);
    if (!text || text.length < 50) {
      return new Response(
        JSON.stringify({
          content: `Página: ${url}\n\n(Contenido no extraído o página vacía. Prueba otra URL o agrega contexto manual.)`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const content = `Información extraída de ${url}:\n\n${text}`;
    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al extraer';
    const isTimeout = message.includes('abort') || message.includes('timeout');
    return new Response(
      JSON.stringify({
        error: isTimeout ? 'La página tardó demasiado. Prueba con otra URL.' : `Error: ${message}`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
