-- Añade todas las columnas extra de organization_bot_config (ejecutar en Supabase si falla "Could not find catalog_invite").
-- Ejecuta este script en SQL Editor de tu proyecto Supabase.

ALTER TABLE organization_bot_config
  ADD COLUMN IF NOT EXISTS catalog_invite TEXT;

ALTER TABLE organization_bot_config
  ADD COLUMN IF NOT EXISTS company_website_url TEXT;

COMMENT ON COLUMN organization_bot_config.catalog_invite IS 'Frase opcional para invitar al cliente a ver la web o el catálogo.';
COMMENT ON COLUMN organization_bot_config.company_website_url IS 'URL de la web de la empresa para que el bot la ofrezca al cliente.';
