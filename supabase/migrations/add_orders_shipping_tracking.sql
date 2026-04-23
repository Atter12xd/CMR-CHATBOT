ALTER TABLE orders
ADD COLUMN IF NOT EXISTS courier TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_tracking_code TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_tracking_url TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_token TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending';

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_last_event TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_updated_at TIMESTAMPTZ;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_status_check;
ALTER TABLE orders
ADD CONSTRAINT orders_shipping_status_check CHECK (
  shipping_status IN ('pending', 'in_transit', 'at_agency', 'out_for_delivery', 'delivered', 'exception')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_tracking_token
ON orders (tracking_token)
WHERE tracking_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_shipping_tracking_code
ON orders (shipping_tracking_code);

COMMENT ON COLUMN orders.courier IS 'Courier o empresa de transporte (Shalom, Olva, etc.)';
COMMENT ON COLUMN orders.shipping_tracking_code IS 'Número de guía del envío';
COMMENT ON COLUMN orders.shipping_tracking_url IS 'URL externa de tracking del courier';
COMMENT ON COLUMN orders.tracking_token IS 'Token público para seguimiento del pedido';
COMMENT ON COLUMN orders.shipping_status IS 'Estado logístico del envío';
COMMENT ON COLUMN orders.shipping_last_event IS 'Último evento de seguimiento';
COMMENT ON COLUMN orders.shipping_updated_at IS 'Última actualización del seguimiento';
