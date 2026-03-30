/** Version REST Admin API (misma que sync y webhooks). */
export function getShopifyAdminApiVersion(): string {
  return (
    import.meta.env.SHOPIFY_ADMIN_API_VERSION ||
    process.env.SHOPIFY_ADMIN_API_VERSION ||
    '2024-10'
  );
}
