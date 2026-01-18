-- Crear tabla para códigos QR de conexión de WhatsApp
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- Código único de 32 caracteres
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scanned', 'expired', 'used')),
  expires_at TIMESTAMPTZ NOT NULL, -- Expira en 5 minutos
  metadata JSONB DEFAULT '{}', -- Datos adicionales (phone_number, etc)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scanned_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_organization_id ON qr_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_expires_at ON qr_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);

-- RLS Policies
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver QR de sus organizaciones
CREATE POLICY "Users can view own qr codes"
  ON qr_codes FOR SELECT
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- Usuarios pueden crear QR para sus organizaciones
CREATE POLICY "Users can insert own qr codes"
  ON qr_codes FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- Usuarios pueden actualizar QR de sus organizaciones
CREATE POLICY "Users can update own qr codes"
  ON qr_codes FOR UPDATE
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- Función para limpiar códigos expirados (opcional - puede ejecutarse manualmente o con cron)
CREATE OR REPLACE FUNCTION cleanup_expired_qr_codes()
RETURNS void AS $$
BEGIN
  UPDATE qr_codes
  SET status = 'expired'
  WHERE expires_at < NOW()
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;
