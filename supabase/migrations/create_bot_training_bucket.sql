-- Bucket para PDFs y archivos de entrenamiento del bot
INSERT INTO storage.buckets (id, name, public)
VALUES ('bot-training', 'bot-training', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Usuarios autenticados pueden subir archivos de entrenamiento"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'bot-training' AND auth.uid() IS NOT NULL);

CREATE POLICY "Todos pueden ver archivos de entrenamiento"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'bot-training');

CREATE POLICY "Usuarios pueden eliminar sus archivos de entrenamiento"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'bot-training' AND auth.uid() IS NOT NULL);
