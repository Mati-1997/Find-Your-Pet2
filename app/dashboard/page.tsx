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
} from "lucide-react"
import { useAuthCheck } from "@/hooks/use-auth-check"
import AlertSummary from "@/components/alert-summary"
import MapView from "@/components/map-view"

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuthCheck()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Buenos días")
    else if (hour < 18) setGreeting("Buenas tardes")
    else setGreeting("Buenas noches")
  }, [])

  // Datos de ejemplo para las mascotas
  const pets = [
    {
      id: "1",
      name: "Max",
      type: "Perro",
      breed: "Golden Retriever",
      status: "safe",
      lastSeen: "Hace 2 horas",
      image: "/placeholder.svg?height=60&width=60",
      batteryLevel: 85,
      isActive: true,
    },
    {
      id: "2",
      name: "Luna",
      type: "Gato",
      breed: "Siamés",
      status: "safe",
      lastSeen: "Hace 30 min",
      image: "/placeholder.svg?height=60&width=60",
      batteryLevel: 92,
      isActive: true,
    },
  ]

  // Datos de ejemplo para ubicaciones en el mapa
  const petLocations = [
    {
      id: "1",
      name: "Max",
      latitude: -34.6037,
      longitude: -58.3816,
      timestamp: new Date().toISOString(),
      status: "found" as const,
    },
    {
      id: "2",
      name: "Luna",
      latitude: -34.6047,
      longitude: -58.3826,
      timestamp: new Date().toISOString(),
      status: "lost" as const,
    },
  ]

  const stats = {
    totalPets: 2,
    activePets: 2,
    alertsToday: 3,
    communityHelps: 12,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-4 ring-white/20">
                  <AvatarImage src="/placeholder.svg?height=48&width=48" />
                  <AvatarFallback className="bg-white/20 text-white font-bold">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{greeting}</h1>
                <p className="text-blue-100">{user?.email || "Usuario"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 relative"
                onClick={() => router.push("/alerts")}
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs">3</Badge>
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
                  <p className="text-purple-100 text-sm">Ayudas</p>
                  <p className="text-2xl font-bold">{stats.communityHelps}</p>
                </div>
                <Award className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción principales */}
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
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                          <AvatarImage src={pet.image || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold">
                            {pet.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {pet.isActive && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
                        <p className="text-gray-600">{pet.breed}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={pet.status === "safe" ? "default" : "destructive"} className="text-xs">
                            {pet.status === "safe" ? "Seguro" : "Perdido"}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {pet.lastSeen}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{pet.batteryLevel}%</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="hover:bg-blue-50">
                          <MapPin className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="hover:bg-green-50">
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              <MapView
                petLocations={petLocations}
                height="300px"
                onMarkerClick={(pet) => {
                  console.log("Clicked pet:", pet)
                }}
              />
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

          {/* Alertas */}
          <div className="space-y-6">
            <AlertSummary />

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
