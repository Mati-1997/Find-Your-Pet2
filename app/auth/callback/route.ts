import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  // Si hay un error en la autenticación
  if (error) {
    console.error("Error en autenticación:", error, error_description)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}&error_description=${error_description}`)
  }

  // Si no hay código, redirigir a la página principal
  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login`)
  }

  try {
    const supabase = createSupabaseServerClient()

    // Intercambiar el código por una sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error al intercambiar código por sesión:", error.message)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=session_error&error_description=${error.message}`)
    }

    // Redirigir a la página principal con mensaje de éxito
    return NextResponse.redirect(`${requestUrl.origin}/login?verified=true`)
  } catch (error: any) {
    console.error("Error en callback de autenticación:", error.message)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=unknown&error_description=${error.message}`)
  }
}
