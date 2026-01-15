-- Crear bucket para archivos de chat
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir a usuarios autenticados subir archivos
CREATE POLICY "Usuarios autenticados pueden subir archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.uid() IS NOT NULL
);

-- Política para permitir a todos ver archivos públicos
CREATE POLICY "Archivos públicos son visibles para todos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-files');

-- Política para permitir a usuarios eliminar sus propios archivos
CREATE POLICY "Usuarios pueden eliminar sus archivos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  auth.uid() IS NOT NULL
);
