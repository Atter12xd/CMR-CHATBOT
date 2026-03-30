import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Valida X-Shopify-Hmac-Sha256 sobre el body crudo (string UTF-8).
 * @see https://shopify.dev/docs/apps/build/webhooks/subscribe/https
 */
export function verifyShopifyWebhookHmac(rawBody: string, secret: string, receivedBase64: string): boolean {
  if (!secret || !receivedBase64) return false;
  const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(digest, 'utf8');
  const b = Buffer.from(receivedBase64, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
