import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const jsonHeaders = { 'Content-Type': 'application/json' };

const DEFAULT_API_VERSION = '2024-10';
const MAX_PAGES = 100;

function buildRequestId() {
  return `shopify_sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length ? text.slice(0, 8000) : null;
}

function nextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',').map((s) => s.trim())) {
    const m = part.match(/<([^>]+)>;\s*rel="next"/);
    if (m) return m[1];
  }
  return null;
}

interface ShopifyVariant {
  price?: string;
  inventory_quantity?: number | null;
}

interface ShopifyImage {
  src?: string;
}

interface ShopifyProduct {
  id: number;
  title: string;
  body_html?: string | null;
  product_type?: string | null;
  vendor?: string | null;
  status?: string;
  images?: ShopifyImage[];
  variants?: ShopifyVariant[];
}

export const POST: APIRoute = async ({ request }) => {
  const requestId = buildRequestId();
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  const { organizationId } = await request.json().catch(() => ({}));

  if (!token || !organizationId) {
    console.warn(`[${requestId}] Missing token or organizationId`);
    return new Response(
      JSON.stringify({ error: 'No autorizado o parámetros incompletos', requestId }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiVersion =
    import.meta.env.SHOPIFY_ADMIN_API_VERSION || process.env.SHOPIFY_ADMIN_API_VERSION || DEFAULT_API_VERSION;

  if (!supabaseUrl || !supabaseAnon || !serviceKey) {
    console.error(`[${requestId}] Missing Supabase env`);
    return new Response(
      JSON.stringify({ error: 'Configuración del servidor incompleta', requestId }),
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
    console.warn(`[${requestId}] Invalid session`, userError?.message);
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
    console.warn(`[${requestId}] Org denied`, { organizationId, userId: user.id });
    return new Response(
      JSON.stringify({ error: 'No autorizado para esta organización', requestId }),
      { status: 403, headers: jsonHeaders },
    );
  }

  const { data: integration, error: intErr } = await supabaseAdmin
    .from('shopify_integrations')
    .select('shop_domain, access_token, status')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (intErr) {
    console.error(`[${requestId}] Load integration failed`, intErr);
    return new Response(
      JSON.stringify({ error: 'No se pudo leer la integración Shopify', requestId }),
      { status: 500, headers: jsonHeaders },
    );
  }
  if (!integration || integration.status !== 'connected' || !integration.access_token || !integration.shop_domain) {
    console.warn(`[${requestId}] Not connected`, { hasRow: !!integration, status: integration?.status });
    return new Response(
      JSON.stringify({ error: 'Shopify no está conectado para esta organización', requestId }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const shop = integration.shop_domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const accessToken = integration.access_token;

  const rows: {
    organization_id: string;
    shopify_product_id: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string | null;
    stock: number | null;
  }[] = [];

  let pageUrl: string | null = `https://${shop}/admin/api/${apiVersion}/products.json?limit=250`;
  let pages = 0;

  try {
    while (pageUrl && pages < MAX_PAGES) {
      pages += 1;
      const res = await fetch(pageUrl, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        console.error(`[${requestId}] Shopify API error`, res.status, bodyText.slice(0, 500));
        return new Response(
          JSON.stringify({
            error: `Shopify respondió ${res.status}. Revisa scopes y tienda.`,
            requestId,
            detail: bodyText.slice(0, 200),
          }),
          { status: 502, headers: jsonHeaders },
        );
      }

      const payload = (await res.json()) as { products?: ShopifyProduct[] };
      const products = payload.products || [];
      console.info(`[${requestId}] Page ${pages}`, { count: products.length });

      for (const p of products) {
        const variant = p.variants?.[0];
        const price = variant?.price != null ? Number.parseFloat(String(variant.price)) : 0;
        const safePrice = Number.isFinite(price) && price >= 0 ? price : 0;
        const stock =
          variant?.inventory_quantity != null && Number.isFinite(Number(variant.inventory_quantity))
            ? Math.max(0, Math.floor(Number(variant.inventory_quantity)))
            : null;
        const image = p.images?.[0]?.src || null;
        const category =
          (p.product_type && p.product_type.trim()) || (p.vendor && p.vendor.trim()) || 'Shopify';

        rows.push({
          organization_id: organizationId,
          shopify_product_id: String(p.id),
          name: p.title || `Producto ${p.id}`,
          description: stripHtml(p.body_html),
          price: safePrice,
          category,
          image_url: image,
          stock,
        });
      }

      pageUrl = nextPageUrl(res.headers.get('Link'));
    }

    if (rows.length === 0) {
      const now = new Date().toISOString();
      await supabaseAdmin
        .from('shopify_integrations')
        .update({ last_sync_at: now, error_message: null })
        .eq('organization_id', organizationId);
      console.info(`[${requestId}] No products in store`);
      return new Response(
        JSON.stringify({ synced: 0, message: 'No hay productos en la tienda', requestId }),
        { status: 200, headers: jsonHeaders },
      );
    }

    const chunkSize = 80;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error: upsertError } = await supabaseAdmin.from('products').upsert(chunk, {
        onConflict: 'organization_id,shopify_product_id',
      });
      if (upsertError) {
        console.error(`[${requestId}] Upsert chunk failed`, upsertError);
        return new Response(
          JSON.stringify({
            error: 'No se pudieron guardar productos en la base de datos. ¿Corriste la migración shopify_product_id?',
            requestId,
            detail: upsertError.message,
          }),
          { status: 500, headers: jsonHeaders },
        );
      }
    }

    const now = new Date().toISOString();
    await supabaseAdmin
      .from('shopify_integrations')
      .update({ last_sync_at: now, error_message: null })
      .eq('organization_id', organizationId);

    console.info(`[${requestId}] Sync complete`, { synced: rows.length, pages });
    return new Response(
      JSON.stringify({ synced: rows.length, pages, requestId }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (err) {
    console.error(`[${requestId}] Unexpected sync error`, err);
    return new Response(
      JSON.stringify({ error: 'Error inesperado al sincronizar', requestId }),
      { status: 500, headers: jsonHeaders },
    );
  }
};
