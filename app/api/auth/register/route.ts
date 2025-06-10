import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone } = await request.json()

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const supabase = createClient()

    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || "",
          phone: phone || "",
        },
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Error al crear el usuario" }, { status: 400 })
    }

    // Crear perfil de usuario en la tabla users
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      full_name: full_name || null,
      phone: phone || null,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      // Si hay error creando el perfil, no fallar completamente
      // El usuario ya fue creado en Auth
    }

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user: authData.user,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
