-- Intención de compra / lead: para saber quién está a punto de comprar
ALTER TABLE chats
ADD COLUMN IF NOT EXISTS last_intent TEXT,
ADD COLUMN IF NOT EXISTS last_intent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_chats_last_intent_at ON chats(last_intent_at DESC)
WHERE last_intent_at IS NOT NULL;

COMMENT ON COLUMN chats.last_intent IS 'Última intención detectada: ej. quiero_comprar, preguntando_precio, cómo_pago';
COMMENT ON COLUMN chats.last_intent_at IS 'Cuándo se detectó la intención (para listar leads recientes)';
