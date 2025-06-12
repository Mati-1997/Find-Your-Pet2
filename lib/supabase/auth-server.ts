import { createSupabaseServerClient } from "./server"

export async function getServerUser() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) return null
  return user
}
