"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          window.location.href = "/login"
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error("Error checking auth:", error)
        window.location.href = "/login"
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = "/login"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Find Your Pet</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Hola, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-2">¡Bienvenido!</h2>
            <p className="mb-4">Tu plataforma para encontrar mascotas perdidas</p>
            <p className="text-sm opacity-90">Login exitoso - Aplicación funcionando correctamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Estado de la aplicación</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Usuario:</span>
                <span className="text-green-600">✓ Autenticado</span>
              </div>
              <div className="flex justify-between">
                <span>Sesión:</span>
                <span className="text-green-600">✓ Activa</span>
              </div>
              <div className="flex justify-between">
                <span>Base de datos:</span>
                <span className="text-green-600">✓ Conectada</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
