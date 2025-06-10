import { createSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = createSupabaseServerClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Redirigir a la página de éxito o dashboard
        return NextResponse.redirect(`${origin}/home`)
      } else {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${origin}/login?error=verification_failed`)
      }
    } catch (error) {
      console.error("Callback error:", error)
      return NextResponse.redirect(`${origin}/login?error=callback_error`)
    }
  }

  // Si no hay código, redirigir al login
  return NextResponse.redirect(`${origin}/login`)
}
