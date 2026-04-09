-- Widget web embebible: clave pública por organización y allowlist de orígenes (hostname, sin esquema).
-- NULL o lista vacía en web_widget_allowed_origins = permitir cualquier Origin (solo recomendado en desarrollo).

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS web_widget_public_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS web_widget_allowed_origins TEXT[] DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_web_widget_public_key
  ON organizations (web_widget_public_key)
  WHERE web_widget_public_key IS NOT NULL;

COMMENT ON COLUMN organizations.web_widget_public_key IS 'Clave pública para el snippet del widget; se valida en /api/public/widget/*';
COMMENT ON COLUMN organizations.web_widget_allowed_origins IS 'Hostnames permitidos (ej. tienda.com, www.tienda.com). NULL o {} = cualquier origen.';
