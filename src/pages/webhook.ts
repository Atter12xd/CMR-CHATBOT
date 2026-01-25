import type { APIRoute } from 'astro';
import { forwardWebhookGet, forwardWebhookPost } from '../lib/webhook-proxy';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Webhook de Meta WhatsApp en /webhook (sin /api/).
 * Meta está configurado con URL: https://wazapp.ai/webhook
 */
export const GET: APIRoute = async ({ request, url }) => {
  console.log('[webhook /] GET', url.searchParams.toString());
  return forwardWebhookGet(url, SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE_KEY ?? '');
};

export const POST: APIRoute = async ({ request }) => {
  console.log('[webhook /] POST');
  return forwardWebhookPost(request, SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE_KEY ?? '');
};
