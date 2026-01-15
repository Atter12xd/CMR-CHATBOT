-- Crear tabla de etiquetas/tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6', -- Color en formato hex
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Crear tabla de relación chat_tags (many-to-many)
CREATE TABLE IF NOT EXISTS chat_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, tag_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_tags_organization_id ON tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_tags_chat_id ON chat_tags(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_tags_tag_id ON chat_tags(tag_id);

-- RLS Policies para tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ));

-- RLS Policies para chat_tags
ALTER TABLE chat_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat tags"
  ON chat_tags FOR SELECT
  USING (chat_id IN (
    SELECT id FROM chats WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert own chat tags"
  ON chat_tags FOR INSERT
  WITH CHECK (chat_id IN (
    SELECT id FROM chats WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete own chat tags"
  ON chat_tags FOR DELETE
  USING (chat_id IN (
    SELECT id FROM chats WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  ));

-- Trigger para updated_at en tags
CREATE OR REPLACE FUNCTION update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tags_updated_at();

-- Insertar etiquetas predefinidas populares
-- Nota: Estas se insertarán automáticamente para cada organización la primera vez que la creen
-- Por ahora dejamos la tabla vacía y las crearemos desde la UI
