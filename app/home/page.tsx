"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, PlusCircle, User, LogOut } from "lucide-react"

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirigiendo al login...</p>
      </div>
    )
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
      <main className="p-4 space-y-6 pb-20">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-2">¡Bienvenido!</h2>
            <p className="mb-4">Tu plataforma para encontrar mascotas perdidas</p>
            <div className="flex space-x-3">
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Reportar mascota
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/20">
                Buscar mascotas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Acciones rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <ActionCard icon={<Search className="w-6 h-6" />} title="Buscar" description="Encuentra mascotas" />
            <ActionCard icon={<MapPin className="w-6 h-6" />} title="Mapa" description="Ver ubicaciones" />
            <ActionCard icon={<PlusCircle className="w-6 h-6" />} title="Reportar" description="Reportar mascota" />
            <ActionCard icon={<User className="w-6 h-6" />} title="Perfil" description="Tu cuenta" />
          </div>
        </div>

        {/* Status */}
        <Card>
          <CardContent className="p-6 text-center">
            <h4 className="font-medium text-gray-900 mb-2">¡Aplicación funcionando!</h4>
            <p className="text-sm text-gray-500">Login exitoso - Usuario autenticado</p>
            <div className="mt-4 text-xs text-gray-400">Usuario ID: {user?.id?.substring(0, 8)}...</div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          <NavButton icon={<Search className="w-5 h-5" />} label="Buscar" />
          <NavButton icon={<MapPin className="w-5 h-5" />} label="Mapa" />
          <NavButton icon={<PlusCircle className="w-5 h-5" />} label="Reportar" active />
          <NavButton icon={<User className="w-5 h-5" />} label="Perfil" />
        </div>
      </nav>
    </div>
  )
}

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">{icon}</div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NavButton({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <button
      className={`flex flex-col items-center justify-center h-full space-y-1 ${
        active ? "text-blue-600" : "text-gray-600"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  )
}
