"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, User, Settings, Bell, MapPin, Shield, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    // Eliminar la cookie de autenticación
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
      duration: 3000,
    })

    // Redireccionar al login
    setTimeout(() => {
      router.push("/login")
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" className="mr-4 p-0" onClick={() => router.push("/home")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Mi perfil</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <div className="space-y-6">
          {/* Perfil */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold">Juan Pérez</h2>
            <p className="text-gray-500">usuario@ejemplo.com</p>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push("/alerts")}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <Bell className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Alertas y notificaciones</h3>
                    <p className="text-sm text-gray-500">Gestionar alertas y configurar notificaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push("/tracking")}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Mis mascotas</h3>
                    <p className="text-sm text-gray-500">Gestionar mascotas y dispositivos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                toast({
                  title: "Configuración",
                  description: "Función en desarrollo",
                  duration: 3000,
                })
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <Settings className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Configuración</h3>
                    <p className="text-sm text-gray-500">Ajustes de cuenta y preferencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                toast({
                  title: "Privacidad",
                  description: "Función en desarrollo",
                  duration: 3000,
                })
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                    <Shield className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Privacidad y seguridad</h3>
                    <p className="text-sm text-gray-500">Gestionar permisos y seguridad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botón de cerrar sesión */}
          <Button
            variant="outline"
            className="w-full mt-8 text-red-500 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </main>
    </div>
  )
}
