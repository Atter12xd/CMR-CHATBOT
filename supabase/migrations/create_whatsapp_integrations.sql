-- Tabla para almacenar las integraciones de WhatsApp por organización
CREATE TABLE IF NOT EXISTS whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL, -- Número formateado: +51987654321
  phone_number_id TEXT, -- ID del número en Meta (ej: 723144527547373)
  access_token TEXT, -- Token de acceso (encriptado)
  business_account_id TEXT, -- ID de cuenta de negocio (ej: 754836650218132)
  app_id TEXT, -- ID de la app (ej: 1697684594201061)
  app_secret TEXT, -- Secret de la app (encriptado)
  webhook_verify_token TEXT, -- Token para verificar webhook
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  verified_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Habilitar RLS
ALTER TABLE whatsapp_integrations ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propia integración de WhatsApp
CREATE POLICY "Users can view own whatsapp integration"
  ON whatsapp_integrations FOR SELECT
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- Política: Los usuarios pueden insertar su propia integración de WhatsApp
CREATE POLICY "Users can insert own whatsapp integration"
  ON whatsapp_integrations FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- Política: Los usuarios pueden actualizar su propia integración de WhatsApp
CREATE POLICY "Users can update own whatsapp integration"
  ON whatsapp_integrations FOR UPDATE
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- Política: Los usuarios pueden eliminar su propia integración de WhatsApp
CREATE POLICY "Users can delete own whatsapp integration"
  ON whatsapp_integrations FOR DELETE
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- Índice para búsquedas rápidas por organization_id
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_organization_id 
  ON whatsapp_integrations(organization_id);

-- Índice para búsquedas por phone_number_id
CREATE INDEX IF NOT EXISTS idx_whatsapp_integrations_phone_number_id 
  ON whatsapp_integrations(phone_number_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_whatsapp_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_whatsapp_integrations_updated_at
  BEFORE UPDATE ON whatsapp_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_integrations_updated_at();

