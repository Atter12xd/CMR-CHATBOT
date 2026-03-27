/**
 * URL pública de la app (sin slash final). OAuth exige que redirect_uri coincida
 * exactamente con una URL permitida en la app de Shopify.
 *
 * Prioridad:
 * 1. SHOPIFY_OAUTH_REDIRECT_BASE (ej. https://wazapp.ai)
 * 2. PUBLIC_SITE_URL
 * 3. Header Origin del request
 * 4. Origin de la URL del request (host del deployment)
 */
export function resolvePublicSiteUrl(request: Request): string {
  const fromEnv = (
    import.meta.env.SHOPIFY_OAUTH_REDIRECT_BASE ||
    process.env.SHOPIFY_OAUTH_REDIRECT_BASE ||
    import.meta.env.PUBLIC_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');

  if (fromEnv) return fromEnv;

  const origin = request.headers.get('origin')?.trim().replace(/\/+$/, '');
  if (origin) return origin;

  return new URL(request.url).origin.replace(/\/+$/, '');
}
