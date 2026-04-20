-- Distingue conversaciones del widget en sitios propios vs. embed en tienda Shopify (ambas platform = 'web').
ALTER TABLE chats
  ADD COLUMN IF NOT EXISTS web_channel TEXT
  CHECK (web_channel IS NULL OR web_channel IN ('site', 'shopify'));

COMMENT ON COLUMN chats.web_channel IS 'Solo aplica a platform=web: site=widget en web propia; shopify=widget en tienda conectada por OAuth.';

CREATE INDEX IF NOT EXISTS idx_chats_org_web_channel ON chats (organization_id, platform, web_channel)
  WHERE platform = 'web';
