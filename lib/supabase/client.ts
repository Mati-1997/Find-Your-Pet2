import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Cliente para componentes del lado del cliente
export const createClient = () => {
  return createClientComponentClient()
}

// Cliente alternativo usando las variables de entorno directamente
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
)

export default createClient
