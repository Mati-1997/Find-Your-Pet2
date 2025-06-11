"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useAuthCheck } from "@/hooks/use-auth-check"

export default function Profile() {
  const router = useRouter()
  const { user, loading } = useAuthCheck()
  const [activeTab, setActiveTab] = useState("overview")

  // Datos de ejemplo del usuario
  const userProfile = {
    name: "María González",
    email: user?.email || "maria@example.com",
    phone: "+54 11 1234-5678",
    location: "Buenos Aires, Argentina",
    joinDate: "Marzo 2023",
    avatar: "/placeholder.svg?height=120&width=120",
    verified: true,
    level: "Rescatista Experto",
    points: 2847,
    badges: ["Primer Rescate", "Héroe Comunitario", "Detector Experto"],
  }

  // Estadísticas del usuario
  const stats = {
    petsFound: 12,
    reportsCreated: 8,
    helpProvided: 24,
    communityRank: 15,
  }

  // Mascotas del usuario
  const userPets = [
    {
      id: "1",
      name: "Max",
      type: "Perro",
      breed: "Golden Retriever",
      age: "3 años",
      status: "safe",
      image: "/placeholder.svg?height=80&width=80",
      chipId: "982000123456789",
      lastCheckup: "15 Nov 2024",
    },
    {
      id: "2",
      name: "Luna",
      type: "Gato",
      breed: "Siamés",
      age: "2 años",
      status: "safe",
      image: "/placeholder.svg?height=80&width=80",
      chipId: "982000987654321",
      lastCheckup: "10 Nov 2024",
    },
  ]

  // Actividad reciente
  const recentActivity = [
    {
      id: 1,
      type: "found",
      description: "Ayudaste a encontrar a 'Toby' en Palermo",
      date: "Hace 2 días",
      points: 50,
    },
    {
      id: 2,
      type: "report",
      description: "Reportaste una mascota perdida",
      date: "Hace 5 días",
      points: 25,
    },
    {
      id: 3,
      type: "help",
      description: "Compartiste información sobre 'Milo'",
      date: "Hace 1 semana",
      points: 15,
    },
  ]

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
            <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/20">
              ← Volver
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
                <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {userProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {userProfile.verified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                {userProfile.verified && <Badge className="bg-green-500 hover:bg-green-600">Verificado</Badge>}
              </div>
              <p className="text-blue-100 text-lg mb-2">{userProfile.level}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {userProfile.email}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {userProfile.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Desde {userProfile.joinDate}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{userProfile.points}</div>
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
              <div className="text-2xl font-bold">{stats.petsFound}</div>
              <div className="text-green-100 text-sm">Mascotas Encontradas</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-blue-200" />
              <div className="text-2xl font-bold">{stats.reportsCreated}</div>
              <div className="text-blue-100 text-sm">Reportes Creados</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-200" />
              <div className="text-2xl font-bold">{stats.helpProvided}</div>
              <div className="text-purple-100 text-sm">Ayudas Brindadas</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-200" />
              <div className="text-2xl font-bold">#{stats.communityRank}</div>
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
                    <span>{userProfile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Miembro desde {userProfile.joinDate}</span>
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
                    {userProfile.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                      >
                        <Star className="w-6 h-6 text-yellow-500" />
                        <span className="font-medium text-gray-800">{badge}</span>
                      </div>
                    ))}
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
                    onClick={() => router.push("/pets/add")}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {userPets.map((pet) => (
                    <div
                      key={pet.id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                            <AvatarImage src={pet.image || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold text-lg">
                              {pet.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                            <p className="text-gray-600">
                              {pet.breed} • {pet.age}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant={pet.status === "safe" ? "default" : "destructive"}>
                                {pet.status === "safe" ? "Seguro" : "Perdido"}
                              </Badge>
                              <span className="text-xs text-gray-500">Chip: {pet.chipId}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-sm text-gray-500">Último chequeo: {pet.lastCheckup}</div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <MapPin className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            activity.type === "found"
                              ? "bg-green-100"
                              : activity.type === "report"
                                ? "bg-blue-100"
                                : "bg-purple-100"
                          }`}
                        >
                          {activity.type === "found" && <Heart className="w-5 h-5 text-green-600" />}
                          {activity.type === "report" && <Bell className="w-5 h-5 text-blue-600" />}
                          {activity.type === "help" && <Award className="w-5 h-5 text-purple-600" />}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
