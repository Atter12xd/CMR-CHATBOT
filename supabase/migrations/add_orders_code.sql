-- Código de pedido para mostrar al cliente (ej. PED-00001)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS code TEXT;

-- Teléfono del cliente (desde el chat de WhatsApp)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Índice para buscar por código y organización
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_organization_code
ON orders (organization_id, code)
WHERE code IS NOT NULL;

-- Comentario
COMMENT ON COLUMN orders.code IS 'Código de pedido mostrado al cliente (ej. PED-00001)';
