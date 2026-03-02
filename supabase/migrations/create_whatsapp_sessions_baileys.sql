-- Sesiones de WhatsApp por cliente (Baileys / Contabo)
-- El servidor Contabo escribe aquí al conectar; el dashboard puede seguir usando whatsapp_integrations.
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connecting', 'qr', 'connected', 'disconnected')),
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_client_id ON whatsapp_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_status ON whatsapp_sessions(status);

-- Opcional: referencia en organizations para client_id de Baileys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'whatsapp_client_id'
  ) THEN
    ALTER TABLE organizations ADD COLUMN whatsapp_client_id TEXT UNIQUE;
  END IF;
END $$;
