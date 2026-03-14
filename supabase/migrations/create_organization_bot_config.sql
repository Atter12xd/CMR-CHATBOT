-- Configuración principal del bot por organización (nombre empresa, a qué se dedica, saludo, nombre del bot).
-- El dueño llena estos campos en "Entrenar Bot" y el bot se presenta y habla según la empresa.

CREATE TABLE IF NOT EXISTS organization_bot_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name TEXT,
  company_description TEXT,
  initial_greeting TEXT,
  bot_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_bot_config_org ON organization_bot_config(organization_id);

COMMENT ON TABLE organization_bot_config IS 'Datos principales para personalizar el bot: nombre empresa, a qué se dedica, saludo inicial, nombre del bot.';

-- RLS
ALTER TABLE organization_bot_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage bot config in own organization"
  ON organization_bot_config FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert bot config for own organization"
  ON organization_bot_config FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );
