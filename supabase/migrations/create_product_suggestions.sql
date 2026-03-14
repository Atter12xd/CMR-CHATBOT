-- Productos sugeridos desde la web (extracción con IA). El dueño revisa y aprueba o rechaza.
CREATE TABLE IF NOT EXISTS product_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL DEFAULT 'Otros',
  source_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_suggestions_org ON product_suggestions(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_suggestions_status ON product_suggestions(status);

COMMENT ON TABLE product_suggestions IS 'Productos extraídos de la web por IA; el dueño aprueba para pasarlos al catálogo.';

ALTER TABLE product_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage product suggestions in own organization"
  ON product_suggestions FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert product suggestions for own organization"
  ON product_suggestions FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );
