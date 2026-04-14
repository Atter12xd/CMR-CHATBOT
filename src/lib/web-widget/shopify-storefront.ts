import type { SupabaseClient } from '@supabase/supabase-js';

/** Dominio tipo `mi-tienda.myshopify.com` (sin protocolo, minúsculas). */
export function normalizeShopifyShopParam(raw: string): string | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(s)) return null;
  return s;
}

/** Tienda Shopify conectada para la org (solo `status = connected`). */
export async function fetchConnectedShopifyDomain(
  db: SupabaseClient,
  organizationId: string,
): Promise<string | null> {
  const { data, error } = await db
    .from('shopify_integrations')
    .select('shop_domain')
    .eq('organization_id', organizationId)
    .eq('status', 'connected')
    .maybeSingle();

  if (error || !data?.shop_domain || typeof data.shop_domain !== 'string') {
    return null;
  }
  return normalizeShopifyShopParam(data.shop_domain) ?? data.shop_domain.trim().toLowerCase();
}
