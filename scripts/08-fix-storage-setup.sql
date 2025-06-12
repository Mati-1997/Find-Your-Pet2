-- Verificar y crear buckets de storage si no existen
DO $$
BEGIN
    -- Crear bucket para imágenes de mascotas si no existe
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'pet-images') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('pet-images', 'pet-images', true);
    END IF;
    
    -- Crear bucket para avatares de usuarios si no existe
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-avatars') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('user-avatars', 'user-avatars', true);
    END IF;
    
    -- Crear bucket para reconocimiento AI si no existe
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ai-recognition') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('ai-recognition', 'ai-recognition', true);
    END IF;
END $$;

-- Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Users can upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view pet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own pet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own pet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload AI recognition images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view AI recognition images" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own AI recognition images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Políticas para pet-images bucket
CREATE POLICY "Anyone can view pet images" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-images');

CREATE POLICY "Authenticated users can upload pet images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update pet images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pet-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete pet images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-images' AND 
    auth.role() = 'authenticated'
  );

-- Políticas para user-avatars bucket
CREATE POLICY "Anyone can view user avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );

-- Políticas para ai-recognition bucket
CREATE POLICY "Users can view AI recognition images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'ai-recognition' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload AI images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ai-recognition' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can manage AI recognition images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'ai-recognition' AND 
    auth.role() = 'authenticated'
  );

-- Verificar que los buckets están configurados correctamente
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets 
WHERE id IN ('pet-images', 'user-avatars', 'ai-recognition');

-- Verificar las políticas de storage
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
