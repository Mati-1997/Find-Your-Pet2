-- Verificar y configurar funcionalidad de avatares

-- 1. Verificar que la columna avatar_url existe en la tabla users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 2. Crear bucket para avatares si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Configurar políticas de storage para avatares
-- Política para ver avatares (público)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars');

-- Política para subir avatares (solo usuarios autenticados)
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para actualizar avatares (solo el propietario)
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE 
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para eliminar avatares (solo el propietario)
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE 
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Función para sincronizar avatar entre auth.users y public.users
CREATE OR REPLACE FUNCTION sync_user_avatar()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar la tabla users cuando se actualiza el avatar en auth metadata
    UPDATE users 
    SET avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para sincronizar automáticamente
DROP TRIGGER IF EXISTS sync_user_avatar_trigger ON auth.users;
CREATE TRIGGER sync_user_avatar_trigger
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION sync_user_avatar();

-- 6. Función para obtener URL completa del avatar
CREATE OR REPLACE FUNCTION get_avatar_url(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    avatar_path TEXT;
    base_url TEXT;
BEGIN
    -- Obtener la URL del avatar desde la tabla users
    SELECT avatar_url INTO avatar_path FROM users WHERE id = user_id;
    
    -- Si no hay avatar, retornar null
    IF avatar_path IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Si ya es una URL completa, retornarla
    IF avatar_path LIKE 'http%' THEN
        RETURN avatar_path;
    END IF;
    
    -- Construir URL completa del storage
    SELECT 
        CONCAT(
            current_setting('app.settings.supabase_url', true),
            '/storage/v1/object/public/user-avatars/',
            avatar_path
        ) INTO base_url;
    
    RETURN base_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Actualizar RLS policies para la tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON users FOR SELECT 
USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON users FOR UPDATE 
USING (auth.uid() = id);

-- 8. Índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url) WHERE avatar_url IS NOT NULL;

-- 9. Comentarios para documentación
COMMENT ON COLUMN users.avatar_url IS 'URL del avatar del usuario almacenado en Supabase Storage';
COMMENT ON FUNCTION get_avatar_url(UUID) IS 'Función helper para obtener la URL completa del avatar de un usuario';
COMMENT ON FUNCTION sync_user_avatar() IS 'Sincroniza el avatar entre auth.users metadata y la tabla users';
