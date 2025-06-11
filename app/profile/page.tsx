"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Edit,
  Heart,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  Award,
  Activity,
  Camera,
  Star,
  TrendingUp,
  Clock,
  Bell,
  PlusCircle,
  AlertTriangle,
} from "lucide-react"
import { useAuthCheck } from "@/hooks/use-auth-check"
import { createClient } from "@/lib/supabase/client"
import { activityService } from "@/lib/activity-service"

export default function Profile() {
  const router = useRouter()
  const { user, loading } = useAuthCheck()
  const [activeTab, setActiveTab] = useState("overview")
  const [userPets, setUserPets] = useState<any[]>([])
  const [userStats, setUserStats] = useState({
    petsFound: 0,
    reportsCreated: 0,
    helpProvided: 0,
    communityRank: 0,
  })
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [userPoints, setUserPoints] = useState(0)

  // Cargar datos del usuario cuando esté disponible
  useEffect(() => {
    if (!loading && user) {
      loadUserPets(user.id)
      loadUserStats(user.id)
      loadUserBadges(user.id)
      loadRecentActivity(user.id)
      loadUserPoints(user.id)
    }
  }, [loading, user])

  // Cargar puntos del usuario
  const loadUserPoints = async (userId: string) => {
    try {
      const points = await activityService.getUserPoints(userId)
      setUserPoints(points)
    } catch (error) {
      console.error("Error loading user points:", error)
    }
  }

  // Cargar mascotas del usuario
  const loadUserPets = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data: pets, error } = await supabase
        .from("pets")
        .select("*")
        .or(`owner_id.eq.${userId},user_id.eq.${userId}`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading user pets:", error)
        return
      }

      setUserPets(pets || [])
    } catch (error) {
      console.error("Error loading pets:", error)
    }
  }

  // Cargar estadísticas del usuario
  const loadUserStats = async (userId: string) => {
    try {
      const supabase = createClient()

      // Contar mascotas encontradas
      const { count: petsFoundCount, error: petsError } = await supabase
        .from("pets")
        .select("*", { count: "exact", head: true })
        .or(`owner_id.eq.${userId},user_id.eq.${userId}`)
        .eq("is_lost", false)

      // Contar reportes creados
      const { count: reportsCount, error: reportsError } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      if (petsError || reportsError) {
        console.error("Error loading user stats")
      }

      setUserStats({
        petsFound: petsFoundCount || 0,
        reportsCreated: reportsCount || 0,
        helpProvided: Math.floor(userPoints / 10),
        communityRank: userPoints > 1000 ? Math.floor(Math.random() * 50) + 1 : 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  // Cargar badges del usuario
  const loadUserBadges = async (userId: string) => {
    try {
      const badges = []

      // Badges basados en actividad
      if (userPets.length > 0) badges.push("Primera Mascota")
      if (userPets.length >= 3) badges.push("Coleccionista")
      if (userPoints >= 100) badges.push("Colaborador Activo")
      if (userPoints >= 500) badges.push("Rescatista")
      if (userPoints >= 1000) badges.push("Héroe Comunitario")
      if (userStats.petsFound > 0) badges.push("Detector Experto")

      setUserBadges(badges.length > 0 ? badges : ["Usuario Nuevo"])
    } catch (error) {
      console.error("Error loading badges:", error)
      setUserBadges(["Usuario Nuevo"])
    }
  }

  // Cargar actividad reciente usando el servicio
  const loadRecentActivity = async (userId: string) => {
    try {
      const result = await activityService.getUserActivities(userId, 5)

      if (result.success && result.data.length > 0) {
        // Mapear los datos de la base de datos al formato esperado
        const mappedActivity = result.data.map((activity: any) => ({
          id: activity.id,
          type: activity.activity_type,
          description: activity.description,
          date: new Date(activity.created_at).toLocaleDateString("es-AR"),
          points: activity.points_earned || 0,
          created_at: activity.created_at,
        }))
        setRecentActivity(mappedActivity)
      } else {
        // Actividad predeterminada basada en mascotas si no hay actividades registradas
        const defaultActivity = userPets.slice(0, 3).map((pet, index) => ({
          id: `default-${index}`,
          type: "pet_registered",
          description: `Registraste a ${pet.name}`,
          date: new Date(pet.created_at).toLocaleDateString("es-AR"),
          points: 25,
          created_at: pet.created_at,
        }))
        setRecentActivity(defaultActivity)
      }
    } catch (error) {
      console.error("Error loading activity:", error)
      setRecentActivity([])
    }
  }

  // Determinar el nivel del usuario basado en puntos
  const getUserLevel = () => {
    if (userPoints >= 5000) return "Rescatista Experto"
    if (userPoints >= 2000) return "Rescatista Avanzado"
    if (userPoints >= 500) return "Rescatista"
    if (userPoints >= 100) return "Colaborador"
    return "Usuario Nuevo"
  }

  // Función para obtener el icono de actividad
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pet_registered":
        return <PlusCircle className="w-5 h-5 text-blue-600" />
      case "pet_found":
        return <Heart className="w-5 h-5 text-green-600" />
      case "pet_lost":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "report_created":
        return <Bell className="w-5 h-5 text-orange-600" />
      case "help_provided":
        return <Award className="w-5 h-5 text-purple-600" />
      case "profile_updated":
        return <User className="w-5 h-5 text-indigo-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  // Función para obtener el color de fondo del icono
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "pet_registered":
        return "bg-blue-100"
      case "pet_found":
        return "bg-green-100"
      case "pet_lost":
        return "bg-red-100"
      case "report_created":
        return "bg-orange-100"
      case "help_provided":
        return "bg-purple-100"
      case "profile_updated":
        return "bg-indigo-100"
      default:
        return "bg-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="text-white hover:bg-white/20">
              ← Volver al inicio
            </Button>
            <Button
              onClick={() => router.push("/profile/edit")}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-white/30 shadow-2xl">
                <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg?height=120&width=120"} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {user?.user_metadata?.full_name
                    ? user.user_metadata.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : user?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {userPoints > 500 && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario"}
                </h1>
                {userPoints > 500 && <Badge className="bg-green-500 hover:bg-green-600">Verificado</Badge>}
              </div>
              <p className="text-blue-100 text-lg mb-2">{getUserLevel()}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {user?.email || "No disponible"}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user?.user_metadata?.location || "Argentina"}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Desde{" "}
                  {new Date(user?.created_at || Date.now()).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{userPoints}</div>
                <div className="text-blue-100 text-sm">Puntos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-green-200" />
              <div className="text-2xl font-bold">{userStats.petsFound}</div>
              <div className="text-green-100 text-sm">Mascotas Encontradas</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-blue-200" />
              <div className="text-2xl font-bold">{userStats.reportsCreated}</div>
              <div className="text-blue-100 text-sm">Reportes Creados</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-200" />
              <div className="text-2xl font-bold">{userStats.helpProvided}</div>
              <div className="text-purple-100 text-sm">Ayudas Brindadas</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-200" />
              <div className="text-2xl font-bold">#{userStats.communityRank || "N/A"}</div>
              <div className="text-orange-100 text-sm">Ranking</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="pets"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Mis Mascotas
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Actividad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{user?.user_metadata?.phone || "No especificado"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{user?.email || "No disponible"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{user?.user_metadata?.location || "No especificado"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>
                      Miembro desde{" "}
                      {new Date(user?.created_at || Date.now()).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Logros */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Logros y Badges
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {userBadges.length > 0 ? (
                      userBadges.map((badge, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                        >
                          <Star className="w-6 h-6 text-yellow-500" />
                          <span className="font-medium text-gray-800">{badge}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <div className="text-4xl mb-2">🏆</div>
                        <p>¡Completa acciones para ganar badges!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pets" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Mis Mascotas ({userPets.length})
                  </div>
                  <Button
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => router.push("/report")}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {userPets.length > 0 ? (
                  <div className="grid gap-6">
                    {userPets.map((pet) => (
                      <div
                        key={pet.id}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                              <AvatarImage src={pet.image_url || "/placeholder.svg?height=80&width=80"} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold text-lg">
                                {pet.name ? pet.name[0] : "P"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                              <p className="text-gray-600">
                                {pet.breed || "Desconocido"} • {pet.age || "Edad desconocida"}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant={pet.is_lost ? "destructive" : "default"}>
                                  {pet.is_lost ? "Perdido" : "Seguro"}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {pet.chip_id ? `Chip: ${pet.chip_id}` : "Sin chip"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-sm text-gray-500">
                              Registrado: {new Date(pet.created_at).toLocaleDateString("es-AR")}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/tracking?pet_id=${pet.id}`)}
                              >
                                <MapPin className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/pet-detail?id=${pet.id}`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🐕</div>
                    <h3 className="font-medium mb-1">No tienes mascotas registradas</h3>
                    <p className="text-sm mb-4">Registra tu primera mascota para comenzar</p>
                    <Button onClick={() => router.push("/report")}>Registrar Mascota</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={activity.id || index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${getActivityBgColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{activity.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{activity.date}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                          +{activity.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="font-medium mb-1">Sin actividad reciente</h3>
                    <p className="text-sm mb-4">Tu actividad aparecerá aquí</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
