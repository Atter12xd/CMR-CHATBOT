-- Bucket para imágenes de productos (público para que el bot pueda referenciar URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Usuarios autenticados pueden subir
CREATE POLICY "Usuarios autenticados pueden subir imágenes de productos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

-- Público puede ver
CREATE POLICY "Imágenes de productos son públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Usuarios autenticados pueden actualizar/eliminar
CREATE POLICY "Usuarios pueden eliminar imágenes de productos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios pueden actualizar imágenes de productos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);
