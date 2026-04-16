-- Llamadas IA / voz: historial por organización (sincronización vía API o panel)
CREATE TABLE IF NOT EXISTS ai_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT NOT NULL CHECK (status IN ('completed', 'scheduled', 'failed')),
  result TEXT CHECK (
    result IS NULL OR result IN ('confirmed', 'rejected', 'no_answer')
  ),
  duration_seconds INTEGER,
  scheduled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_calls_organization ON ai_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_calls_status ON ai_calls(status);
CREATE INDEX IF NOT EXISTS idx_ai_calls_scheduled ON ai_calls(scheduled_at);

ALTER TABLE ai_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage ai_calls in own organization"
  ON ai_calls FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

COMMENT ON TABLE ai_calls IS 'Llamadas automatizadas (IA); insertar vía backend o integración';
