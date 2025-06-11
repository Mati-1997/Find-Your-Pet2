-- Verificar y actualizar la tabla de mascotas
-- Agregar columnas que podrían faltar

-- Agregar user_id si no existe (para compatibilidad)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'user_id') THEN
        ALTER TABLE pets ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Agregar owner_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'owner_id') THEN
        ALTER TABLE pets ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Agregar contact_name si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'contact_name') THEN
        ALTER TABLE pets ADD COLUMN contact_name TEXT;
    END IF;
END $$;

-- Agregar contact_phone si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'contact_phone') THEN
        ALTER TABLE pets ADD COLUMN contact_phone TEXT;
    END IF;
END $$;

-- Agregar contact_email si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'contact_email') THEN
        ALTER TABLE pets ADD COLUMN contact_email TEXT;
    END IF;
END $$;

-- Agregar reward si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'reward') THEN
        ALTER TABLE pets ADD COLUMN reward TEXT;
    END IF;
END $$;

-- Agregar last_seen_location si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'last_seen_location') THEN
        ALTER TABLE pets ADD COLUMN last_seen_location TEXT;
    END IF;
END $$;

-- Agregar last_seen_date si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pets' AND column_name = 'last_seen_date') THEN
        ALTER TABLE pets ADD COLUMN last_seen_date DATE;
    END IF;
END $$;

-- Actualizar user_id con owner_id donde sea necesario
UPDATE pets SET user_id = owner_id WHERE user_id IS NULL AND owner_id IS NOT NULL;
UPDATE pets SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pets' 
ORDER BY ordinal_position;
