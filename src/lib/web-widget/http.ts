import { isOriginAllowed, parseOriginHostname } from './origins';

function widgetSiteHostname(): string | null {
  const site = String(import.meta.env.SITE || '').trim();
  if (!site) return null;
  try {
    return new URL(site).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * El JS del widget dentro de widget-embed-iframe.html hace fetch con Origin = SITE (p. ej. wazapp.ai),
 * no con el dominio del sitio cliente. Sin este bypass, la lista «dominios permitidos» bloquearía el iframe.
 */
function isWidgetHostedEmbedOrigin(originHeader: string | null): boolean {
  const host = parseOriginHostname(originHeader);
  const siteHost = widgetSiteHostname();
  if (!host || !siteHost) return false;
  return host === siteHost || host.endsWith('.' + siteHost);
}

export function widgetCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

export function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...widgetCorsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
}

export type WidgetOrgRow = {
  id: string;
  name: string;
  openai_api_key: string | null;
  web_widget_allowed_origins: string[] | null;
};

/**
 * @param shopifyShopDomain — `tienda.myshopify.com` si la org tiene Shopify conectado; el storefront en ese host puede usar el widget aunque no esté en la lista manual de dominios.
 */
export function assertWidgetOriginAllowed(
  org: WidgetOrgRow,
  request: Request,
  shopifyShopDomain?: string | null,
): boolean {
  const origin = request.headers.get('Origin');
  if (isWidgetHostedEmbedOrigin(origin)) return true;

  if (shopifyShopDomain) {
    const host = parseOriginHostname(origin);
    const shop = shopifyShopDomain.trim().toLowerCase();
    if (host && shop && host === shop) {
      return true;
    }
  }

  return isOriginAllowed(org.web_widget_allowed_origins, origin);
}

const VISITOR_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidVisitorId(id: unknown): id is string {
  return typeof id === 'string' && VISITOR_ID_RE.test(id);
}
