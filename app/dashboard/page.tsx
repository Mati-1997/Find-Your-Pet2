"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  MapPin,
  Bell,
  Search,
  PlusCircle,
  Settings,
  User,
  Zap,
  Shield,
  Camera,
  Navigation,
  Activity,
  TrendingUp,
  Clock,
  Award,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react"
import { useAuthCheck } from "@/hooks/use-auth-check"
import MapView from "@/components/map-view"

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuthCheck()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return

      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

        setUserProfile(profile)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [user?.id])

  const [pets, setPets] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalPets: 0,
    activePets: 0,
    alertsToday: 3,
    communityHelps: 12,
  })

  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user?.id) return

      try {
        const { petService } = await import("@/lib/supabase/pets")
        const userPets = await petService.getUserPets(user.id)

        setPets(userPets)
        setStats((prev) => ({
          ...prev,
          totalPets: userPets.length,
          activePets: userPets.filter((pet) => !pet.is_lost).length,
        }))

        // Crear notificaciones para mascotas registradas
        const petNotifications = userPets.map((pet) => ({
          id: `pet-${pet.id}`,
          type: pet.is_lost ? "pet_lost" : "pet_registered",
          title: pet.is_lost ? `${pet.name} reportado como perdido` : `${pet.name} registrado exitosamente`,
          message: pet.is_lost
            ? `Tu mascota ${pet.name} ha sido reportada como perdida en ${pet.last_seen_location || "ubicación desconocida"}`
            : `Tu mascota ${pet.name} ha sido registrada en el sistema`,
          timestamp: pet.created_at,
          read: false,
          icon: pet.is_lost ? "🚨" : "✅",
        }))

        setNotifications(petNotifications)
      } catch (error) {
        console.error("Error fetching pets:", error)
      }
    }

    fetchUserPets()
  }, [user?.id])

  const petLocations = pets.map((pet, index) => ({
    id: pet.id,
    name: pet.name,
    latitude: -34.6037 + index * 0.001,
    longitude: -58.3816 + index * 0.001,
    timestamp: pet.updated_at || new Date().toISOString(),
    status: pet.is_lost ? ("lost" as const) : ("found" as const),
  }))

  const handleSupportClick = () => {
    const message = `Hola, necesito ayuda con FindYourPet. Mi usuario es: ${user?.email}`
    const whatsappUrl = `https://wa.me/542804537189?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  const displayName = userProfile?.full_name || user?.email?.split("@")[0] || "Usuario"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-4 ring-white/20">
                  <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg?height=48&width=48"} />
                  <AvatarFallback className="bg-white/20 text-white font-bold">
                    {displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hola, {displayName}</h1>
                <p className="text-blue-100">{user?.email || "Usuario"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 relative"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-5 w-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs">
                    {notifications.filter((n) => !n.read).length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Mis Mascotas</p>
                  <p className="text-2xl font-bold">{stats.totalPets}</p>
                </div>
                <Heart className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Activas</p>
                  <p className="text-2xl font-bold">{stats.activePets}</p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Alertas Hoy</p>
                  <p className="text-2xl font-bold">{stats.alertsToday}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Reportes</p>
                  <p className="text-2xl font-bold">{pets.filter((pet) => pet.is_lost).length}</p>
                </div>
                <Award className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción principales - CORREGIDOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => router.push("/report")}
            className="h-20 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <PlusCircle className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Reportar</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push("/search")}
            className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <Search className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Buscar</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push("/tracking")}
            className="h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <Navigation className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm font-medium">GPS</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push("/profile")}
            className="h-20 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <User className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Perfil</span>
            </div>
          </Button>
        </div>

        {/* Mis Mascotas */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Heart className="w-6 h-6 mr-2" />
              Mis Mascotas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {pets.length > 0 ? (
                pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => router.push(`/pet-detail?id=${pet.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                            <AvatarImage src={pet.image_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold">
                              {pet.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {!pet.is_lost && (
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
                          <p className="text-gray-600">{pet.breed || pet.species}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={!pet.is_lost ? "default" : "destructive"} className="text-xs">
                              {!pet.is_lost ? "Seguro" : "Perdido"}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Reportado recientemente
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/tracking?pet=${pet.id}`)
                            }}
                          >
                            <MapPin className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/pet-detail?id=${pet.id}`)
                            }}
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No tienes mascotas registradas</h3>
                  <p className="text-gray-500 mb-4">Reporta tu primera mascota para comenzar</p>
                  <Button
                    onClick={() => router.push("/report")}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Reportar Mascota
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grid de contenido principal */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mapa */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <MapPin className="w-6 h-6 mr-2" />
                Ubicaciones en Tiempo Real
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pets.length > 0 ? (
                <MapView
                  petLocations={petLocations}
                  height="300px"
                  onMarkerClick={(pet) => {
                    router.push(`/pet-detail?id=${pet.id}`)
                  }}
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No hay mascotas para mostrar en el mapa</p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <Button
                  onClick={() => router.push("/map")}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  Ver Mapa Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Soporte y Acciones rápidas */}
          <div className="space-y-6">
            {/* Soporte */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Soporte
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-gray-600 text-sm mb-4">¿Necesitas ayuda? Contáctanos ante cualquier duda</p>

                <Button
                  onClick={handleSupportClick}
                  className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-12"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  WhatsApp: +54 2804537189
                </Button>

                <Button
                  onClick={() =>
                    window.open(
                      "mailto:cristiansorw@gmail.com?subject=Soporte FindYourPet&body=Hola, necesito ayuda con FindYourPet. Mi usuario es: " +
                        user?.email,
                      "_blank",
                    )
                  }
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  cristiansorw@gmail.com
                </Button>
              </CardContent>
            </Card>

            {/* Acciones rápidas adicionales */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Zap className="w-6 h-6 mr-2" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={() => router.push("/nose-print")}
                  className="w-full justify-start bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white h-12"
                >
                  <Shield className="w-5 h-5 mr-3" />
                  Huella Nasal
                </Button>

                <Button
                  onClick={() => router.push("/ai-recognition")}
                  className="w-full justify-start bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white h-12"
                >
                  <Camera className="w-5 h-5 mr-3" />
                  Reconocimiento IA
                </Button>

                <Button
                  onClick={() => router.push("/alerts")}
                  className="w-full justify-start bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-12"
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Centro de Alertas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estadísticas de actividad */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="w-6 h-6 mr-2" />
              Actividad de la Comunidad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                <div className="text-sm text-gray-600">Mascotas encontradas hoy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">156</div>
                <div className="text-sm text-gray-600">Usuarios activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">89</div>
                <div className="text-sm text-gray-600">Reportes esta semana</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">342</div>
                <div className="text-sm text-gray-600">Ayudas brindadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
