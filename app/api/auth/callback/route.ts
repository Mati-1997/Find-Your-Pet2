import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()
  const { email, password, full_name, phone } = await request.json()

  // Validación básica
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email y contraseña son requeridos' },
      { status: 400 }
    )
  }

  try {
    // Registrar usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone: phone || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Crear perfil del usuario en la tabla profiles
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name,
          phone: phone || null,
          email,
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error del servidor' },
      { status: 500 }
    )
  }
}