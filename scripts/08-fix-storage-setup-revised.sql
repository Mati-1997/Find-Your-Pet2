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

-- Verificar políticas existentes y crear solo las que faltan
DO $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    -- Políticas para pet-images bucket
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Anyone can view pet images'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Anyone can view pet images" ON storage.objects
                FOR SELECT USING (bucket_id = ''pet-images'')';
    END IF;

    -- Verificar y crear política para upload de imágenes de mascotas
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload pet images'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Authenticated users can upload pet images" ON storage.objects
                FOR INSERT WITH CHECK (
                    bucket_id = ''pet-images'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;

    -- Verificar y crear política para actualizar imágenes de mascotas
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update pet images'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Users can update pet images" ON storage.objects
                FOR UPDATE USING (
                    bucket_id = ''pet-images'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;

    -- Verificar y crear política para eliminar imágenes de mascotas
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete pet images'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Users can delete pet images" ON storage.objects
                FOR DELETE USING (
                    bucket_id = ''pet-images'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;

    -- Políticas para user-avatars bucket
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Anyone can view user avatars'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Anyone can view user avatars" ON storage.objects
                FOR SELECT USING (bucket_id = ''user-avatars'')';
    END IF;

    -- Verificar y crear política para upload de avatares
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload avatars'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
                FOR INSERT WITH CHECK (
                    bucket_id = ''user-avatars'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;

    -- Verificar y crear política para actualizar avatares
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update avatars'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Users can update avatars" ON storage.objects
                FOR UPDATE USING (
                    bucket_id = ''user-avatars'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;

    -- Verificar y crear política para eliminar avatares
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete avatars'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Users can delete avatars" ON storage.objects
                FOR DELETE USING (
                    bucket_id = ''user-avatars'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;

    -- Políticas para ai-recognition bucket
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can view AI recognition images'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Users can view AI recognition images" ON storage.objects
                FOR SELECT USING (
                    bucket_id = ''ai-recognition'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;

    -- Verificar y crear política para upload de imágenes AI
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload AI images'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Authenticated users can upload AI images" ON storage.objects
                FOR INSERT WITH CHECK (
                    bucket_id = ''ai-recognition'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;

    -- Verificar y crear política para gestionar imágenes AI
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can manage AI recognition images'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Users can manage AI recognition images" ON storage.objects
                FOR ALL USING (
                    bucket_id = ''ai-recognition'' AND 
                    auth.role() = ''authenticated''
                )';
    END IF;
END $$;

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
