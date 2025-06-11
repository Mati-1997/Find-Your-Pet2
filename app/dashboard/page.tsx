"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, PlusCircle, Bell, User, LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)
      } else {
        router.push("/login")
      }
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      })
    }
  }

  const handleNavigation = (path: string, name: string) => {
    console.log(`Navegando a: ${path}`)
    toast({
      title: "Navegación",
      description: `Ir a ${name}`,
    })
    // Por ahora solo mostramos un toast, luego implementaremos las páginas
    // router.push(path)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Find Your Pet</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hola, {user.user_metadata?.full_name || user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-2">¡Bienvenido a Find Your Pet!</h2>
              <p className="mb-4">Tu plataforma para encontrar mascotas perdidas usando tecnología avanzada</p>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => handleNavigation("/report", "Reportar mascota")}
                >
                  Reportar mascota perdida
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                  onClick={() => handleNavigation("/search", "Buscar mascotas")}
                >
                  Buscar mascotas
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              title="Buscar Mascota"
              description="Usa IA para encontrar mascotas"
              icon={<Search className="w-6 h-6" />}
              onClick={() => handleNavigation("/search", "Buscar Mascota")}
            />
            <ActionCard
              title="Ver Mapa"
              description="Ubicaciones de mascotas perdidas"
              icon={<MapPin className="w-6 h-6" />}
              onClick={() => handleNavigation("/map", "Ver Mapa")}
            />
            <ActionCard
              title="Reportar"
              description="Reporta una mascota perdida"
              icon={<PlusCircle className="w-6 h-6" />}
              onClick={() => handleNavigation("/report", "Reportar")}
            />
            <ActionCard
              title="Alertas"
              description="Configura alertas personalizadas"
              icon={<Bell className="w-6 h-6" />}
              onClick={() => handleNavigation("/alerts", "Alertas")}
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Actividad reciente</h2>
          <Card>
            <CardHeader>
              <CardTitle>Mascotas reportadas recientemente</CardTitle>
              <CardDescription>Las últimas mascotas reportadas en tu área</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No hay actividad reciente</p>
                <p className="text-sm mt-2">Las mascotas reportadas aparecerán aquí</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-4 h-16">
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => handleNavigation("/search", "Buscar")}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Buscar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => handleNavigation("/map", "Mapa")}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs mt-1">Mapa</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none text-primary"
            onClick={() => handleNavigation("/report", "Reportar")}
          >
            <PlusCircle className="w-5 h-5 text-primary" />
            <span className="text-xs mt-1">Reportar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => handleNavigation("/profile", "Perfil")}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Perfil</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}

function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onClick}>
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-3 text-primary">{icon}</div>
        <h3 className="font-medium mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </CardContent>
    </Card>
  )
}
