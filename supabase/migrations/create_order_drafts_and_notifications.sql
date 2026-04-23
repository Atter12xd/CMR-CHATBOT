CREATE TABLE IF NOT EXISTS order_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_dni TEXT,
  address_or_reference TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'converted', 'abandoned')),
  source TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'web_widget', 'manual')),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  currency TEXT NOT NULL DEFAULT 'PEN',
  last_customer_message_at TIMESTAMPTZ,
  last_agent_action_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  converted_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_draft_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_id UUID NOT NULL REFERENCES order_drafts(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'web', 'email')),
  template_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'failed')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_drafts_org_chat ON order_drafts(organization_id, chat_id);
CREATE INDEX IF NOT EXISTS idx_order_drafts_status ON order_drafts(status);
CREATE INDEX IF NOT EXISTS idx_order_drafts_expires ON order_drafts(expires_at);
CREATE INDEX IF NOT EXISTS idx_order_draft_items_draft ON order_draft_items(draft_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_order ON order_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_org_created ON order_notifications(organization_id, created_at DESC);

ALTER TABLE order_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_draft_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage order drafts in own organization"
  ON order_drafts FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage order draft items in own organization"
  ON order_draft_items FOR ALL
  USING (
    draft_id IN (
      SELECT id FROM order_drafts
      WHERE organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage order notifications in own organization"
  ON order_notifications FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS update_order_drafts_updated_at ON order_drafts;
CREATE TRIGGER update_order_drafts_updated_at
  BEFORE UPDATE ON order_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_draft_items_updated_at ON order_draft_items;
CREATE TRIGGER update_order_draft_items_updated_at
  BEFORE UPDATE ON order_draft_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE order_drafts IS 'Borradores de pedido para recuperar carrito y retomar checkout por chat';
COMMENT ON TABLE order_notifications IS 'Historial de notificaciones de estado de pedido enviadas al cliente';
