-- Este script corrige los permisos de los buckets de almacenamiento
-- y asegura que las políticas permitan operaciones de lectura/escritura

-- Asegurar que los buckets sean públicos
UPDATE storage.buckets SET public = true WHERE id IN ('pet-images', 'user-avatars', 'ai-recognition');

-- Crear una política general para permitir todas las operaciones a usuarios autenticados
-- Esta política es más permisiva y debería resolver problemas de permisos
DO $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    -- Verificar si la política general ya existe
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users full access'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        EXECUTE 'CREATE POLICY "Allow authenticated users full access" ON storage.objects
                FOR ALL USING (auth.role() = ''authenticated'')
                WITH CHECK (auth.role() = ''authenticated'')';
    END IF;
END $$;

-- Verificar que los buckets estén configurados correctamente
SELECT id, name, public FROM storage.buckets 
WHERE id IN ('pet-images', 'user-avatars', 'ai-recognition');

-- Verificar las políticas existentes
SELECT policyname, cmd, roles FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
