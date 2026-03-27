-- Vincula filas de products con Shopify para upsert en cada sync
ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_product_id TEXT;

-- PostgreSQL trata NULL como distinto en UNIQUE: varios productos manuales sin Shopify por org siguen OK.
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_organization_shopify_product_id
  ON products (organization_id, shopify_product_id);
