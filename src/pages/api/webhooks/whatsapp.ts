import type { APIRoute } from 'astro';

// Este endpoint actúa como proxy para el webhook de Meta
// Meta llama a este endpoint, y este llama a la Edge Function de Supabase con autenticación

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const GET: APIRoute = async ({ request, url }) => {
  // Reenviar el GET request a Supabase Edge Function
  const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  
  // Copiar todos los query parameters
  const queryParams = url.searchParams.toString();
  const fullUrl = queryParams 
    ? `${supabaseWebhookUrl}?${queryParams}`
    : supabaseWebhookUrl;

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    const text = await response.text();
    
    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    console.error('Error forwarding webhook:', error);
    return new Response('Internal server error', {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  // Reenviar el POST request a Supabase Edge Function
  const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  
  // Obtener el body y headers originales
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

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
    
    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    console.error('Error forwarding webhook:', error);
    return new Response('Internal server error', {
      status: 500,
    });
  }
};
