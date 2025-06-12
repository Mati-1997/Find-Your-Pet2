import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500, headers: corsHeaders },
      )
    }

    // Usar service role key para operaciones administrativas
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("Attempting to register user:", email)

    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: full_name || "",
        phone: phone || "",
      },
      email_confirm: false, // Auto-confirm for development
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400, headers: corsHeaders })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Error al crear el usuario" }, { status: 400, headers: corsHeaders })
    }

    console.log("User created in auth:", authData.user.id)

    // Crear perfil de usuario en la tabla users (el trigger debería hacer esto automáticamente)
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .upsert({
        id: authData.user.id,
        email,
        full_name: full_name || null,
        phone: phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (profileError) {
      console.error("Profile error:", profileError)
      // No fallar completamente si hay error en el perfil
    } else {
      console.log("Profile created:", profileData)
    }

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: authData.user,
        profile: profileData,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500, headers: corsHeaders })
  }
}

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
