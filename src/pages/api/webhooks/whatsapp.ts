import type { APIRoute } from 'astro';

export const prerender = false;

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const GET: APIRoute = async ({ request, url }) => {
  console.log('[Vercel Proxy] GET /webhook', url.searchParams.toString());
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Vercel Proxy] Missing env vars');
    return new Response('Server configuration error', { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
  const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  const queryParams = url.searchParams.toString();
  const fullUrl = queryParams ? `${supabaseWebhookUrl}?${queryParams}` : supabaseWebhookUrl;
  try {
    console.log('[Vercel Proxy] Forwarding to:', fullUrl);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY },
    });
    const text = await response.text();
    console.log('[Vercel Proxy] Supabase response:', response.status);
    return new Response(text, { status: response.status, headers: { 'Content-Type': 'text/plain' } });
  } catch (error: any) {
    console.error('[Vercel Proxy] Error:', error.message);
    return new Response(`Internal server error: ${error.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  console.log('[Vercel Proxy] POST /webhook received');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Vercel Proxy] Missing env vars');
    return new Response('Server configuration error', { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
  const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  console.log('[Vercel Proxy] Body length:', body.length, '| Signature:', !!signature);
  try {
    console.log('[Vercel Proxy] Forwarding to Supabase');
    const response = await fetch(supabaseWebhookUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        ...(signature && { 'x-hub-signature-256': signature }),
      },
      body,
    });
    const text = await response.text();
    console.log('[Vercel Proxy] Supabase response:', response.status);
    return new Response(text, { status: response.status, headers: { 'Content-Type': 'text/plain' } });
  } catch (error: any) {
    console.error('[Vercel Proxy] Error:', error.message);
    return new Response(`Internal server error: ${error.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
};
