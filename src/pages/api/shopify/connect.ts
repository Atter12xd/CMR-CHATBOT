import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';

export const prerender = false;
const jsonHeaders = { 'Content-Type': 'application/json' };

function normalizeShopDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
}

function isValidShopDomain(shop: string): boolean {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop);
}

function buildRequestId() {
  return `shopify_connect_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const POST: APIRoute = async ({ request }) => {
  const requestId = buildRequestId();
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) {
    console.warn(`[${requestId}] Missing bearer token`);
    return new Response(JSON.stringify({ error: 'No autorizado', requestId }), { status: 401, headers: jsonHeaders });
  }

  const { shopDomain, organizationId } = await request.json().catch(() => ({}));
  const normalizedShop = normalizeShopDomain(String(shopDomain || ''));
  if (!normalizedShop || !isValidShopDomain(normalizedShop)) {
    console.warn(`[${requestId}] Invalid shop domain:`, shopDomain);
    return new Response(
      JSON.stringify({ error: 'Dominio inválido. Usa mi-tienda.myshopify.com', requestId }),
      { status: 400, headers: jsonHeaders },
    );
  }
  if (!organizationId) {
    console.warn(`[${requestId}] Missing organizationId`);
    return new Response(JSON.stringify({ error: 'organizationId es requerido', requestId }), { status: 400, headers: jsonHeaders });
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const shopifyApiKey = import.meta.env.SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY;
  const shopifyApiSecret = import.meta.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_API_SECRET;
  const shopifyScopes =
    import.meta.env.SHOPIFY_SCOPES || process.env.SHOPIFY_SCOPES || 'read_products,read_inventory';

  if (!supabaseUrl || !supabaseAnon || !serviceKey || !shopifyApiKey || !shopifyApiSecret) {
    console.error(`[${requestId}] Missing required env vars`);
    return new Response(
      JSON.stringify({ error: 'Configuración incompleta para Shopify OAuth', requestId }),
      { status: 500, headers: jsonHeaders },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    console.warn(`[${requestId}] Invalid auth token`, userError?.message);
    return new Response(JSON.stringify({ error: 'Sesión inválida', requestId }), { status: 401, headers: jsonHeaders });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (orgError || !org) {
    console.warn(`[${requestId}] Org access denied`, { organizationId, userId: user.id });
    return new Response(JSON.stringify({ error: 'No autorizado para esta organización', requestId }), {
      status: 403,
      headers: jsonHeaders,
    });
  }

  const origin = request.headers.get('origin') || new URL(request.url).origin;
  const redirectUri = `${origin}/api/shopify/callback`;
  const statePayload = Buffer.from(
    JSON.stringify({
      organizationId,
      shop: normalizedShop,
      ts: Date.now(),
    }),
  ).toString('base64url');
  const signature = createHmac('sha256', shopifyApiSecret).update(statePayload).digest('hex');
  const state = `${statePayload}.${signature}`;

  const authUrl = `https://${normalizedShop}/admin/oauth/authorize?client_id=${encodeURIComponent(
    shopifyApiKey,
  )}&scope=${encodeURIComponent(shopifyScopes)}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&state=${encodeURIComponent(state)}`;

  console.info(`[${requestId}] OAuth initialized`, { organizationId, shop: normalizedShop, redirectUri });
  return new Response(JSON.stringify({ authUrl, requestId }), { status: 200, headers: jsonHeaders });
};

