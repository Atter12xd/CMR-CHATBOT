-- URL oficial de la web de la empresa (el bot puede decir "vea nuestra web: [url]").
ALTER TABLE organization_bot_config
  ADD COLUMN IF NOT EXISTS company_website_url TEXT;

COMMENT ON COLUMN organization_bot_config.company_website_url IS 'URL de la web de la empresa para que el bot la ofrezca al cliente.';
