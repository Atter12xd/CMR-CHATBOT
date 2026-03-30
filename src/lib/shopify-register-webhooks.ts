import { getShopifyAdminApiVersion } from './shopify-admin';

const TOPICS = ['products/create', 'products/update', 'products/delete'] as const;

function normalizeShop(shop: string): string {
  return shop.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
}

/**
 * Registra webhooks HTTPS en la tienda (idempotente: no duplica misma topic+address).
 * No lanza: solo loguea errores para no bloquear el OAuth.
 */
export async function registerShopifyProductWebhooks(
  shopDomain: string,
  accessToken: string,
  publicBaseUrl: string,
): Promise<void> {
  const shop = normalizeShop(shopDomain);
  const apiVersion = getShopifyAdminApiVersion();
  const base = publicBaseUrl.replace(/\/+$/, '');
  const address = `${base}/api/webhooks/shopify`;

  const readHeaders = {
    'X-Shopify-Access-Token': accessToken,
    Accept: 'application/json',
  };
  const writeHeaders = {
    ...readHeaders,
    'Content-Type': 'application/json',
  };

  try {
    const listRes = await fetch(`https://${shop}/admin/api/${apiVersion}/webhooks.json`, { headers: readHeaders });
    const listData = await listRes.json().catch(() => ({}));
    const existing = (listData as { webhooks?: { id: number; topic: string; address: string }[] }).webhooks || [];

    for (const topic of TOPICS) {
      const already = existing.some((w) => w.topic === topic && w.address === address);
      if (already) {
        console.info('[shopify webhooks] ya existe', { topic, address });
        continue;
      }

      const createRes = await fetch(`https://${shop}/admin/api/${apiVersion}/webhooks.json`, {
        method: 'POST',
        headers: writeHeaders,
        body: JSON.stringify({
          webhook: { topic, address, format: 'json' },
        }),
      });

      if (!createRes.ok) {
        const text = await createRes.text().catch(() => '');
        console.warn('[shopify webhooks] crear falló', topic, createRes.status, text.slice(0, 400));
        continue;
      }

      console.info('[shopify webhooks] creado', { topic, address });
    }
  } catch (e) {
    console.error('[shopify webhooks] error registrando', e);
  }
}
