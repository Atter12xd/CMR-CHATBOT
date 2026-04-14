import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { jsonResponse, widgetCorsHeaders } from '../../../../lib/web-widget/http';
import { normalizeShopifyShopParam } from '../../../../lib/web-widget/shopify-storefront';
import { normalizeWidgetSiteKey } from '../../../../lib/web-widget/site-key';

export const prerender = false;

export const OPTIONS: APIRoute = ({ request }) =>
  new Response(null, { status: 204, headers: widgetCorsHeaders(request) });

/**
 * Resuelve `siteKey` del widget a partir del dominio myshopify (tienda con OAuth + widget configurado).
 * No expone datos si la tienda no está conectada o no hay clave de widget.
 */
const LOG = '[widget/shopify-site-key]';

export const GET: APIRoute = async ({ request, url }) => {
  const rawShop = url.searchParams.get('shop') || '';
  const shop = normalizeShopifyShopParam(rawShop);
  if (!shop) {
    console.warn(LOG, '400 shop inválido', {
      recibido: rawShop ? String(rawShop).slice(0, 80) : '(vacío)',
      esperado: 'subdominio.myshopify.com en minúsculas',
    });
    return jsonResponse(request, { error: 'Parámetro shop inválido (usa tu-tienda.myshopify.com)' }, 400);
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error(LOG, '500 faltan PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el servidor');
    return jsonResponse(request, { error: 'Servidor no configurado' }, 500);
  }

  const db = createClient(supabaseUrl, serviceKey);

  const { data: row, error } = await db
    .from('shopify_integrations')
    .select('organization_id')
    .eq('shop_domain', shop)
    .eq('status', 'connected')
    .maybeSingle();

  if (error) {
    console.error(LOG, '500 error Supabase shopify_integrations', shop, error.message);
    return jsonResponse(request, { error: 'Error al consultar la tienda' }, 500);
  }

  if (!row?.organization_id) {
    console.warn(LOG, '404 sin integración connected para shop_domain=', shop);
    return jsonResponse(
      request,
      {
        error: 'Tienda no conectada',
        hint: 'Conecta Shopify en Configuración y asegúrate de que el dominio coincida con el de la instalación.',
      },
      404,
    );
  }

  const { data: org, error: orgErr } = await db
    .from('organizations')
    .select('web_widget_public_key')
    .eq('id', row.organization_id)
    .maybeSingle();

  if (orgErr) {
    console.error(LOG, '500 error Supabase organizations', shop, orgErr.message);
    return jsonResponse(request, { error: 'Error al leer organización' }, 500);
  }

  const rawKey = org?.web_widget_public_key;
  if (!rawKey || typeof rawKey !== 'string') {
    console.warn(LOG, '404 org sin web_widget_public_key', { shop, organizationId: row.organization_id });
    return jsonResponse(
      request,
      {
        error: 'Widget no configurado',
        hint: 'Genera el código del widget en Configuración → Chat en tu página web.',
      },
      404,
    );
  }

  const siteKey = normalizeWidgetSiteKey(rawKey);
  console.info(LOG, '200 clave entregada para tienda', shop);
  return jsonResponse(request, { siteKey });
};
