-- Frase para que el bot invite a ver la web o el catálogo (según lo que hayas entrenado).
ALTER TABLE organization_bot_config
  ADD COLUMN IF NOT EXISTS catalog_invite TEXT;

COMMENT ON COLUMN organization_bot_config.catalog_invite IS 'Frase opcional para invitar al cliente a ver la web o el catálogo. Ej: "Puede ver nuestra web" o "¿Le paso el catálogo?"';
