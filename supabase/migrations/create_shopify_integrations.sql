CREATE TABLE IF NOT EXISTS shopify_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  access_token TEXT NOT NULL,
  scopes TEXT,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopify_integrations_organization_id
  ON shopify_integrations(organization_id);

CREATE INDEX IF NOT EXISTS idx_shopify_integrations_shop_domain
  ON shopify_integrations(shop_domain);

CREATE OR REPLACE FUNCTION update_shopify_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_shopify_integrations_updated_at ON shopify_integrations;
CREATE TRIGGER trigger_update_shopify_integrations_updated_at
BEFORE UPDATE ON shopify_integrations
FOR EACH ROW
EXECUTE FUNCTION update_shopify_integrations_updated_at();

