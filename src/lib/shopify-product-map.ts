export interface ShopifyVariant {
  price?: string;
  inventory_quantity?: number | null;
}

export interface ShopifyImage {
  src?: string;
}

export interface ShopifyProductPayload {
  id: number;
  title: string;
  body_html?: string | null;
  product_type?: string | null;
  vendor?: string | null;
  status?: string;
  images?: ShopifyImage[];
  variants?: ShopifyVariant[];
}

export function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length ? text.slice(0, 8000) : null;
}

export function mapShopifyProductToRow(
  organizationId: string,
  p: ShopifyProductPayload,
): {
  organization_id: string;
  shopify_product_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number | null;
} {
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

  return {
    organization_id: organizationId,
    shopify_product_id: String(p.id),
    name: p.title || `Producto ${p.id}`,
    description: stripHtml(p.body_html),
    price: safePrice,
    category,
    image_url: image,
    stock,
  };
}
