import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { verifyShopifyWebhookHmac } from '../../../lib/shopify-webhook-hmac';
import { mapShopifyProductToRow, type ShopifyProductPayload } from '../../../lib/shopify-product-map';
import { getShopifyAdminApiVersion } from '../../../lib/shopify-admin';

export const prerender = false;

function normalizeShopDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
}

function buildRequestId() {
  return `shopify_wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ ok: true, hint: 'Shopify envía eventos por POST' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const requestId = buildRequestId();
  const rawBody = await request.text();

  const shopifySecret = import.meta.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_API_SECRET;
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256') || '';

  if (!shopifySecret || !verifyShopifyWebhookHmac(rawBody, shopifySecret, hmacHeader)) {
    console.warn(`[${requestId}] webhook HMAC inválido o sin secreto`);
    return new Response('Unauthorized', { status: 401 });
  }

  const topic = request.headers.get('x-shopify-topic') || '';
  const shopHeader = normalizeShopDomain(request.headers.get('x-shopify-shop-domain') || '');
  const webhookId = request.headers.get('x-shopify-webhook-id') || '';

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(`[${requestId}] Supabase service no configurado`);
    return new Response('Server misconfiguration', { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const { data: integration, error: intErr } = await supabaseAdmin
    .from('shopify_integrations')
    .select('organization_id, status')
    .eq('shop_domain', shopHeader)
    .maybeSingle();

  if (intErr) {
    console.error(`[${requestId}] DB integration`, intErr);
    return new Response('Error', { status: 500 });
  }
  if (!integration || integration.status !== 'connected') {
    console.warn(`[${requestId}] tienda no conectada`, { shop: shopHeader });
    return new Response('OK', { status: 200 });
  }

  const organizationId = integration.organization_id as string;

  try {
    if (topic === 'products/delete') {
      const payload = JSON.parse(rawBody) as { id?: number };
      const id = payload.id;
      if (id == null) {
        console.warn(`[${requestId}] products/delete sin id`);
        return new Response('OK', { status: 200 });
      }
      await supabaseAdmin
        .from('products')
        .delete()
        .eq('organization_id', organizationId)
        .eq('shopify_product_id', String(id));

      await supabaseAdmin
        .from('shopify_integrations')
        .update({ last_sync_at: new Date().toISOString(), error_message: null })
        .eq('organization_id', organizationId);

      console.info(`[${requestId}] products/delete`, { shop: shopHeader, id, webhookId });
      return new Response('OK', { status: 200 });
    }

    if (topic === 'products/create' || topic === 'products/update') {
      const product = JSON.parse(rawBody) as ShopifyProductPayload;
      if (!product?.id) {
        console.warn(`[${requestId}] payload sin product.id`, { topic });
        return new Response('OK', { status: 200 });
      }

      const row = mapShopifyProductToRow(organizationId, product);
      const { error: upErr } = await supabaseAdmin.from('products').upsert(row, {
        onConflict: 'organization_id,shopify_product_id',
      });

      if (upErr) {
        console.error(`[${requestId}] upsert producto`, upErr);
        return new Response('DB error', { status: 500 });
      }

      await supabaseAdmin
        .from('shopify_integrations')
        .update({ last_sync_at: new Date().toISOString(), error_message: null })
        .eq('organization_id', organizationId);

      console.info(`[${requestId}] ${topic}`, {
        shop: shopHeader,
        productId: product.id,
        webhookId,
        apiVersion: getShopifyAdminApiVersion(),
      });
      return new Response('OK', { status: 200 });
    }

    console.info(`[${requestId}] topic ignorado`, { topic, webhookId });
    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error(`[${requestId}] webhook error`, e);
    return new Response('Error', { status: 500 });
  }
};
