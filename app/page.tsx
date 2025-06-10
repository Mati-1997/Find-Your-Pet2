"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          console.error("Missing Supabase environment variables")
          router.push("/login")
          return
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Verificar si hay una sesión activa
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error checking session:", error)
          router.push("/login")
          return
        }

        if (session?.user) {
          // Usuario autenticado, redirigir al dashboard
          router.push("/home")
        } else {
          // No hay sesión, redirigir al login
          router.push("/login")
        }
      } catch (error) {
        console.error("Error in auth check:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
