"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Bell, Award, PlusCircle, Search, Map, User, MessageSquareHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useAuthCheck } from "@/hooks/use-auth-check"
import Link from "next/link"

interface Pet {
  id: string
  name: string
  breed?: string
  species?: string
  is_lost: boolean
  image_url?: string
  last_seen_location?: string
  created_at: string
}

interface UserProfile {
  id: string
  full_name?: string
  points?: number
  level?: string
  badges?: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuthCheck()
  const [pets, setPets] = useState<Pet[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({
    totalPets: 0,
    activePets: 0,
    alertsToday: 0,
    totalReports: 0,
  })

  useEffect(() => {
    if (!loading && user) {
      loadUserData()
    }
  }, [loading, user])

  const loadUserData = async () => {
    try {
      const supabase = createClient()

      // Cargar perfil del usuario
      const { data: profileData } = await supabase.from("user_profiles").select("*").eq("user_id", user?.id).single()

      if (profileData) {
        setUserProfile(profileData)
      }

      // Cargar mascotas del usuario
      const { data: petsData, error: petsError } = await supabase
        .from("pets")
        .select("*")
        .or(`owner_id.eq.${user?.id},user_id.eq.${user?.id}`)
        .order("created_at", { ascending: false })

      if (petsError) {
        console.error("Error loading pets:", petsError)
      } else if (petsData) {
        setPets(petsData)

        // Calcular estadísticas
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

        setStats({
          totalPets: petsData.length,
          activePets: petsData.filter((pet) => pet.is_lost).length,
          alertsToday: petsData.filter((pet) => pet.is_lost && new Date(pet.created_at).toISOString() >= today).length,
          totalReports: petsData.filter((pet) => pet.is_lost).length,
        })
      }
    } catch (error) {
      console.error("Error in loadUserData:", error)
    }
  }

  const getUserName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
    }
    if (user?.email) {
      // Extraer la parte antes del @ en el email
      return user.email.split("@")[0]
    }
    return "Usuario"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center">
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Hola, {getUserName()}</h1>
              <p className="text-sm text-blue-100">{user?.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-500"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-500"
                onClick={() => router.push("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-blue-500 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col items-center">
              <Heart className="h-6 w-6 mb-2" />
              <p className="text-xs font-medium">Mis Mascotas</p>
              <p className="text-2xl font-bold">{stats.totalPets}</p>
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col items-center">
              <MapPin className="h-6 w-6 mb-2" />
              <p className="text-xs font-medium">Activas</p>
              <p className="text-2xl font-bold">{stats.activePets}</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col items-center">
              <Bell className="h-6 w-6 mb-2" />
              <p className="text-xs font-medium">Alertas Hoy</p>
              <p className="text-2xl font-bold">{stats.alertsToday}</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col items-center">
              <Award className="h-6 w-6 mb-2" />
              <p className="text-xs font-medium">Reportes</p>
              <p className="text-2xl font-bold">{stats.totalReports}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-4 gap-4">
          <Button className="bg-red-500 hover:bg-red-600 text-white h-14" onClick={() => router.push("/report")}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Reportar
          </Button>

          <Button className="bg-blue-500 hover:bg-blue-600 text-white h-14" onClick={() => router.push("/search")}>
            <Search className="h-5 w-5 mr-2" />
            Buscar
          </Button>

          <Button className="bg-green-500 hover:bg-green-600 text-white h-14" onClick={() => router.push("/map")}>
            <Map className="h-5 w-5 mr-2" />
            GPS
          </Button>

          <Button className="bg-purple-500 hover:bg-purple-600 text-white h-14" onClick={() => router.push("/profile")}>
            <User className="h-5 w-5 mr-2" />
            Perfil
          </Button>
        </div>
      </div>

      {/* Pets Section */}
      <div className="container mx-auto px-4 mt-6">
        <Card className="overflow-hidden">
          <div className="bg-indigo-500 p-4">
            <div className="flex items-center text-white">
              <Heart className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Mis Mascotas</h2>
            </div>
          </div>

          <CardContent className="p-0">
            {pets.length > 0 ? (
              <div className="divide-y">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/pet-detail?id=${pet.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {pet.image_url ? (
                          <img
                            src={pet.image_url || "/placeholder.svg"}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">🐾</span>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-sm text-gray-500">{pet.breed || pet.species || "Mascota"}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pet.is_lost ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {pet.is_lost ? "Perdido" : "Seguro"}
                      </span>
                      {pet.last_seen_location && (
                        <span className="ml-2 text-xs text-gray-500">{pet.last_seen_location}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                <Heart className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No tienes mascotas registradas</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md">Reporta tu primera mascota para comenzar</p>
                <div className="mt-6">
                  <Button onClick={() => router.push("/report")} className="bg-blue-500 hover:bg-blue-600 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Reportar Mascota
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="bg-green-500 p-4">
            <div className="flex items-center text-white">
              <MapPin className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Ubicaciones en Tiempo Real</h2>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="py-8 flex flex-col items-center justify-center text-center p-4">
              <MapPin className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-900">Mapa no disponible</h3>
              <p className="mt-1 text-sm text-gray-500">Contenedor del mapa no encontrado</p>
              <div className="mt-4 text-xs text-gray-500 max-w-xs">
                <p className="font-medium mb-1">Para habilitar el mapa:</p>
                <ol className="list-decimal list-inside text-left space-y-1">
                  <li>Obtén una API key de Google Maps</li>
                  <li>Habilita Maps JavaScript API</li>
                  <li>Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
                  <li>Activa la facturación en Google Cloud</li>
                </ol>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => router.push("/map")} className="text-sm">
                  Ver Mapa Completo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card>
          <div className="bg-blue-500 p-4">
            <div className="flex items-center text-white">
              <MessageSquareHeart className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Soporte</h2>
            </div>
          </div>

          <CardContent className="p-4">
            <p className="text-gray-600 mb-4">¿Necesitas ayuda? Contáctanos ante cualquier duda</p>

            <div className="space-y-3">
              <a
                href={`https://wa.me/542804537189?text=Hola,%20soy%20${encodeURIComponent(
                  user?.email || "usuario",
                )}%20de%20FindYourPet.%20Necesito%20ayuda%20con:`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-3"
                >
                  <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 13.5723 2.37892 15.0721 3.06513 16.3915L2.0332 21.1252C1.94156 21.5344 2.30737 21.9002 2.71655 21.8086L7.50136 20.7767C8.78256 21.4146 10.2336 21.7695 11.7568 21.7695C17.2798 21.7695 21.7569 17.2924 21.7569 11.7695C21.7569 6.24658 17.2231 2 12.001 2ZM16.5723 15.3066C16.3574 15.9248 15.4395 16.4219 14.7266 16.5469C14.2324 16.6328 13.6016 16.6914 11.5723 15.8633C9.0332 14.8574 7.38086 12.2695 7.25586 12.1133C7.13086 11.957 6.25 10.7949 6.25 9.58301C6.25 8.37207 6.86523 7.78613 7.11133 7.52051C7.31836 7.30176 7.63086 7.20801 7.92969 7.20801C8.02344 7.20801 8.10742 7.21387 8.18164 7.2197C8.42773 7.23145 8.55273 7.24902 8.71875 7.63574C8.92578 8.11621 9.41211 9.32715 9.47461 9.45801C9.53711 9.58887 9.59961 9.76074 9.51562 9.92676C9.4375 10.0986 9.36523 10.1836 9.23438 10.3379C9.10352 10.4922 8.98242 10.6113 8.85156 10.7715C8.73242 10.9141 8.59961 11.0684 8.75 11.3184C8.90039 11.5625 9.38672 12.3633 10.1016 13.0078C11.0137 13.8203 11.7598 14.0859 12.0332 14.2051C12.2324 14.293 12.4668 14.2754 12.6211 14.1152C12.8164 13.9141 13.0566 13.5859 13.3027 13.2637C13.4824 13.0312 13.7109 13.0078 13.9512 13.0957C14.1973 13.1777 15.3984 13.7695 15.668 13.9023C15.9375 14.0352 16.1133 14.0977 16.1758 14.2051C16.2383 14.3125 16.2383 14.8535 16.0234 15.4717L16.5723 15.3066Z" />
                </svg>
                WhatsApp: +54 280 453 7189
              </a>

              <a
                href={`mailto:cristiansorw@gmail.com?subject=Soporte%20FindYourPet&body=Hola,%20soy%20${encodeURIComponent(
                  user?.email || "usuario",
                )}%20de%20FindYourPet.%0A%0ANecesito%20ayuda%20con:%0A%0A`}
                className="flex items-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-3"
                >
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                cristiansorw@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 mt-6 mb-8">
        <Card>
          <div className="bg-orange-500 p-4">
            <div className="flex items-center text-white">
              <PlusCircle className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Acciones Rápidas</h2>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3">
              <Link href="/nose-print">
                <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white h-12 justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 mr-3"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                  Huella Nasal
                </Button>
              </Link>

              <Link href="/ai-recognition">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white h-12 justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 mr-3"
                  >
                    <path d="M9 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
                    <path d="M17.06 17.06l4.94 4.94 1.06-1.06-4.94-4.94z" />
                  </svg>
                  Reconocimiento IA
                </Button>
              </Link>

              <Link href="/location-history">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 mr-3"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Control de Visitas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
