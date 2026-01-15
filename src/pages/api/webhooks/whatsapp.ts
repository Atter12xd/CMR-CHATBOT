import type { APIRoute } from 'astro';

// Este endpoint actúa como proxy para el webhook de Meta
// Meta llama a este endpoint, y este llama a la Edge Function de Supabase con autenticación

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const GET: APIRoute = async ({ request, url }) => {
  console.log('=== Webhook GET recibido en Vercel ===');
  console.log('URL:', url.toString());
  console.log('Query params:', url.searchParams.toString());

  // Verificar variables de entorno
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Variables de entorno faltantes:', {
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
    });
    return new Response('Server configuration error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Reenviar el GET request a Supabase Edge Function
  const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  
  // Copiar todos los query parameters
  const queryParams = url.searchParams.toString();
  const fullUrl = queryParams 
    ? `${supabaseWebhookUrl}?${queryParams}`
    : supabaseWebhookUrl;

  console.log('Llamando a Supabase:', fullUrl.replace(SUPABASE_SERVICE_ROLE_KEY, '***'));

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    const text = await response.text();
    console.log('Respuesta de Supabase:', { status: response.status, text: text.substring(0, 100) });
    
    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    console.error('Error forwarding webhook:', error);
    return new Response(`Internal server error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  console.log('=== Webhook POST recibido en Vercel ===');

  // Verificar variables de entorno
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Variables de entorno faltantes');
    return new Response('Server configuration error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Reenviar el POST request a Supabase Edge Function
  const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  
  // Obtener el body y headers originales
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  console.log('Body length:', body.length);
  console.log('Signature:', signature ? 'present' : 'missing');

  try {
    const response = await fetch(supabaseWebhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        ...(signature && { 'x-hub-signature-256': signature }),
      },
      body: body,
    });

    const text = await response.text();
    console.log('Respuesta de Supabase POST:', { status: response.status });
    
    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    console.error('Error forwarding webhook:', error);
    return new Response(`Internal server error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};
