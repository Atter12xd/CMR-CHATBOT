import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { registerShopifyProductWebhooks } from '../../../lib/shopify-register-webhooks';
import { resolvePublicSiteUrl } from '../../../lib/shopify-public-url';

export const prerender = false;

const jsonHeaders = { 'Content-Type': 'application/json' };

function buildRequestId() {
  return `shopify_regwh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Registra webhooks de productos en Shopify (tiendas ya conectadas sin pasar OAuth de nuevo). */
export const POST: APIRoute = async ({ request }) => {
  const requestId = buildRequestId();
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  const { organizationId } = await request.json().catch(() => ({}));

  if (!token || !organizationId) {
    return new Response(JSON.stringify({ error: 'No autorizado', requestId }), { status: 400, headers: jsonHeaders });
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnon || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Configuración incompleta', requestId }), { status: 500, headers: jsonHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Sesión inválida', requestId }), { status: 401, headers: jsonHeaders });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!org) {
    return new Response(JSON.stringify({ error: 'No autorizado', requestId }), { status: 403, headers: jsonHeaders });
  }

  const { data: integration } = await supabaseAdmin
    .from('shopify_integrations')
    .select('shop_domain, access_token, status')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (!integration?.access_token || integration.status !== 'connected' || !integration.shop_domain) {
    return new Response(JSON.stringify({ error: 'Shopify no está conectado', requestId }), { status: 400, headers: jsonHeaders });
  }

  const publicBase = resolvePublicSiteUrl(request);
  await registerShopifyProductWebhooks(integration.shop_domain, integration.access_token, publicBase);

  console.info(`[${requestId}] register-webhooks manual`, { organizationId });
  return new Response(JSON.stringify({ ok: true, requestId }), { status: 200, headers: jsonHeaders });
};
