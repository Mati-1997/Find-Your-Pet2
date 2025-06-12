import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Agregar headers CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const { email, password, full_name, phone } = await request.json()

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400, headers: corsHeaders })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400, headers: corsHeaders },
      )
    }

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500, headers: corsHeaders },
      )
    }

    // Importar dinámicamente para evitar problemas de SSR
    const { createClient } = await import("@supabase/supabase-js")

    const supabase = createClient(supabaseUrl, supabaseKey)

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
      return NextResponse.json({ error: authError.message }, { status: 400, headers: corsHeaders })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Error al crear el usuario" }, { status: 400, headers: corsHeaders })
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

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: authData.user,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500, headers: corsHeaders })
  }
}

// Manejar preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
