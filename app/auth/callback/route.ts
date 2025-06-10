import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const error_description = searchParams.get("error_description")

  console.log("Auth callback called with:", {
    code: !!code,
    error,
    error_description,
    origin,
    fullUrl: request.url,
  })

  // Si hay un error en los parámetros
  if (error) {
    console.error("Auth callback error:", error, error_description)
    const errorMessage = error_description || error
    return NextResponse.redirect(
      `${origin}/login?error=verification_failed&message=${encodeURIComponent(errorMessage)}`,
    )
  }

  if (code) {
    try {
      // Crear cliente de Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase environment variables")
        return NextResponse.redirect(`${origin}/login?error=config_error`)
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Intercambiar el código por una sesión
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(
          `${origin}/login?error=verification_failed&message=${encodeURIComponent(exchangeError.message)}`,
        )
      }

      if (data.user && data.session) {
        console.log("User verified successfully:", {
          userId: data.user.id,
          email: data.user.email,
          emailConfirmed: !!data.user.email_confirmed_at,
        })

        // Redirigir directamente al home si el usuario está verificado
        if (data.user.email_confirmed_at) {
          return NextResponse.redirect(`${origin}/home`)
        } else {
          return NextResponse.redirect(`${origin}/login?message=email_verified`)
        }
      }
    } catch (error: any) {
      console.error("Callback error:", error)
      return NextResponse.redirect(`${origin}/login?error=callback_error&message=${encodeURIComponent(error.message)}`)
    }
  }

  // Si no hay código, redirigir al login
  console.log("No code provided, redirecting to login")
  return NextResponse.redirect(`${origin}/login`)
}
