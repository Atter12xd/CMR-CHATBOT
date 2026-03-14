-- Dirección de entrega y DNI del cliente en el pedido
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_dni TEXT;

-- Estado "completed" = pago completado (asesor tomará datos finales)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed')
);

COMMENT ON COLUMN orders.delivery_address IS 'Dirección de entrega o referencia del cliente';
COMMENT ON COLUMN orders.customer_dni IS 'DNI del cliente';
