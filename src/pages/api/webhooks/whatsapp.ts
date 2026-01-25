import type { APIRoute } from 'astro';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const GET: APIRoute = async ({ request, url }) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Server configuration error', { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
  const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  const queryParams = url.searchParams.toString();
  const fullUrl = queryParams ? `${supabaseWebhookUrl}?${queryParams}` : supabaseWebhookUrl;
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY },
    });
    const text = await response.text();
    return new Response(text, { status: response.status, headers: { 'Content-Type': 'text/plain' } });
  } catch (error: any) {
    return new Response(`Internal server error: ${error.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Server configuration error', { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
  const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  try {
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
    return new Response(text, { status: response.status, headers: { 'Content-Type': 'text/plain' } });
  } catch (error: any) {
    return new Response(`Internal server error: ${error.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
};
