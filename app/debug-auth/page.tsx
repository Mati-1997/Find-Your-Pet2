"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()

        // Get session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        // Get user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        setAuthState({
          session: session,
          user: user,
          sessionError: error,
          userError: userError,
          hasSession: !!session,
          hasUser: !!user,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        setAuthState({
          error: error,
          timestamp: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const testLogin = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "testpassword",
      })

      console.log("Login test:", { data, error })
    } catch (error) {
      console.error("Login test error:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Cargando debug info...</div>
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debug de Autenticación</h1>
        <Button onClick={() => router.push("/dashboard")}>Ir al Dashboard</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(authState, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variables de Entorno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurada" : "❌ No configurada"}
            </p>
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ No configurada"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones de Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testLogin}>Test Login</Button>
          <Button onClick={() => window.location.reload()}>Recargar Página</Button>
          <Button onClick={() => router.push("/login")}>Ir a Login</Button>
        </CardContent>
      </Card>
    </div>
  )
}
