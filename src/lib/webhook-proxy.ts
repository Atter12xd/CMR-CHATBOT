/**
 * Proxy del webhook de Meta WhatsApp.
 * Reenvía GET/POST a la Edge Function de Supabase con autenticación.
 */

const SUPABASE_WEBHOOK_PATH = '/functions/v1/whatsapp-webhook';

export async function forwardWebhookGet(
  url: URL,
  supabaseUrl: string,
  serviceKey: string
): Promise<Response> {
  if (!supabaseUrl || !serviceKey) {
    console.error('webhook-proxy: SUPABASE_URL o SERVICE_ROLE_KEY faltantes');
    return new Response('Server configuration error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const base = supabaseUrl.replace(/\/$/, '');
  const query = url.searchParams.toString();
  const fullUrl = query ? `${base}${SUPABASE_WEBHOOK_PATH}?${query}` : `${base}${SUPABASE_WEBHOOK_PATH}`;

  try {
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('webhook-proxy GET error:', msg);
    return new Response(`Internal server error: ${msg}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export async function forwardWebhookPost(
  request: Request,
  supabaseUrl: string,
  serviceKey: string
): Promise<Response> {
  if (!supabaseUrl || !serviceKey) {
    console.error('webhook-proxy: SUPABASE_URL o SERVICE_ROLE_KEY faltantes');
    return new Response('Server configuration error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const base = supabaseUrl.replace(/\/$/, '');
  const fullUrl = `${base}${SUPABASE_WEBHOOK_PATH}`;
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  try {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
        ...(signature && { 'x-hub-signature-256': signature }),
      },
      body,
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('webhook-proxy POST error:', msg);
    return new Response(`Internal server error: ${msg}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
