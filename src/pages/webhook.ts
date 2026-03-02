import type { APIRoute } from 'astro';

export const prerender = false;

/** WhatsApp ya no usa webhook de Meta; la integración es vía Baileys en servidor Contabo. Ver integracionwazapp.md */
export const GET: APIRoute = () => {
  return new Response('WhatsApp integration is now via Baileys (Contabo server). This webhook is deprecated.', {
    status: 410,
    headers: { 'Content-Type': 'text/plain' },
  });
};

export const POST: APIRoute = () => {
  return new Response('WhatsApp integration is now via Baileys (Contabo server). This webhook is deprecated.', {
    status: 410,
    headers: { 'Content-Type': 'text/plain' },
  });
};
