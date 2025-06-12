import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      },
    )

    // Manejar tokens expirados
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully")
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out")
        // Limpiar cualquier estado local si es necesario
      }
    })
  }

  return supabaseInstance
}
