import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { resolvePublicSiteUrl } from '../../../lib/shopify-public-url';

export const prerender = false;

function normalizeShopDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function buildRequestId() {
  return `shopify_callback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function redirectConfig(baseUrl: string, status: 'connected' | 'error', message: string, requestId: string, shop?: string) {
  const redirectUrl = new URL('/configuracion', baseUrl);
  redirectUrl.searchParams.set('shopify', status);
  redirectUrl.searchParams.set('message', message);
  redirectUrl.searchParams.set('requestId', requestId);
  if (shop) redirectUrl.searchParams.set('shop', shop);
  return Response.redirect(redirectUrl.toString(), 302);
}

function verifyState(state: string, secret: string): { organizationId: string; shop: string } | null {
  const [payload, signature] = state.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  if (!safeEqual(expected, signature)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!parsed?.organizationId || !parsed?.shop) return null;
    return {
      organizationId: String(parsed.organizationId),
      shop: normalizeShopDomain(String(parsed.shop)),
    };
  } catch {
    return null;
  }
}

function verifyHmac(params: URLSearchParams, secret: string, received: string): boolean {
  const message = Array.from(params.entries())
    .filter(([k]) => k !== 'hmac' && k !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const digest = createHmac('sha256', secret).update(message).digest('hex');
  return safeEqual(digest, received);
}

export const GET: APIRoute = async ({ request, url }) => {
  const requestId = buildRequestId();
  const publicBase = resolvePublicSiteUrl(request);
  console.info(`[${requestId}] Callback hit`, { publicBase, host: new URL(request.url).host });

  const shopifyApiKey = import.meta.env.SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY;
  const shopifyApiSecret = import.meta.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_API_SECRET;
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!shopifyApiKey || !shopifyApiSecret || !supabaseUrl || !serviceKey) {
    console.error(`[${requestId}] Missing env vars for callback`);
    return redirectConfig(publicBase, 'error', 'Configuración incompleta del servidor', requestId);
  }

  const shop = normalizeShopDomain(url.searchParams.get('shop') || '');
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const hmac = url.searchParams.get('hmac') || '';

  if (!shop || !code || !state || !hmac) {
    console.warn(`[${requestId}] Missing callback params`, { shop, hasCode: !!code, hasState: !!state, hasHmac: !!hmac });
    return redirectConfig(publicBase, 'error', 'Parámetros incompletos en callback', requestId);
  }

  if (!verifyHmac(url.searchParams, shopifyApiSecret, hmac)) {
    console.warn(`[${requestId}] HMAC validation failed`, { shop });
    return redirectConfig(publicBase, 'error', 'Validación de seguridad falló (HMAC)', requestId, shop);
  }

  const stateData = verifyState(state, shopifyApiSecret);
  if (!stateData || stateData.shop !== shop) {
    console.warn(`[${requestId}] State validation failed`, { shop, stateShop: stateData?.shop });
    return redirectConfig(publicBase, 'error', 'State inválido en OAuth', requestId, shop);
  }

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: shopifyApiKey,
        client_secret: shopifyApiSecret,
        code,
      }),
    });
    const tokenData = await tokenRes.json().catch(() => ({}));

    if (!tokenRes.ok || !tokenData?.access_token) {
      console.error(`[${requestId}] Shopify token exchange failed`, tokenData);
      return redirectConfig(publicBase, 'error', 'No se pudo obtener token de Shopify', requestId, shop);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { error: upsertError } = await supabaseAdmin.from('shopify_integrations').upsert(
      {
        organization_id: stateData.organizationId,
        shop_domain: shop,
        access_token: tokenData.access_token,
        scopes: tokenData.scope || null,
        status: 'connected',
        connected_at: new Date().toISOString(),
        last_sync_at: new Date().toISOString(),
        error_message: null,
      },
      { onConflict: 'organization_id' },
    );

    if (upsertError) {
      console.error(`[${requestId}] Failed to save integration`, upsertError);
      return redirectConfig(publicBase, 'error', 'No se pudo guardar integración', requestId, shop);
    }

    console.info(`[${requestId}] Shopify connected successfully`, {
      organizationId: stateData.organizationId,
      shop,
      scopes: tokenData.scope || null,
    });
    return redirectConfig(publicBase, 'connected', 'Shopify conectado correctamente', requestId, shop);
  } catch (error) {
    console.error(`[${requestId}] Unexpected callback error`, error);
    return redirectConfig(publicBase, 'error', 'Error inesperado al conectar Shopify', requestId, shop);
  }
};

