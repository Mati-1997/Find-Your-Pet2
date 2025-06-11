"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Edit, MapPin, Calendar, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuthCheck } from "@/hooks/use-auth-check"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading, isAuthenticated } = useAuthCheck()
  const [userPets, setUserPets] = useState<any[]>([])

  // Remove the existing useEffect for auth check and replace with:
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast({
          title: "Inicia sesión",
          description: "Necesitas iniciar sesión para ver tu perfil",
          variant: "destructive",
        })
        router.push("/login")
      } else if (user) {
        loadUserPets(user.id)
      }
    }
  }, [loading, isAuthenticated, user, router])

  const loadUserPets = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data: pets, error } = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", userId)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" className="mr-4 p-0" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Mi Perfil</h1>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={() => router.push("/profile/edit")}>
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {/* Profile Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.user_metadata?.full_name || "Usuario"}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <Badge variant="outline" className="mt-1">
                  Miembro desde {new Date(user?.created_at).toLocaleDateString("es-AR")}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{user?.user_metadata?.phone || "No especificado"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-medium">Buenos Aires, Argentina</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Miembro desde</p>
                  <p className="font-medium">{new Date(user?.created_at).toLocaleDateString("es-AR")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userPets.length}</div>
              <p className="text-sm text-gray-600">Mascotas registradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{userPets.filter((pet) => pet.is_lost).length}</div>
              <p className="text-sm text-gray-600">Perdidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userPets.filter((pet) => !pet.is_lost).length}</div>
              <p className="text-sm text-gray-600">Encontradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-600">Ayudas realizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* My Pets */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Mascotas</CardTitle>
          </CardHeader>
          <CardContent>
            {userPets.length > 0 ? (
              <div className="space-y-4">
                {userPets.map((pet) => (
                  <Card
                    key={pet.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => router.push(`/pet-detail?id=${pet.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🐕</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{pet.name}</h3>
                              <p className="text-sm text-gray-600">{pet.breed}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Registrado el {new Date(pet.created_at).toLocaleDateString("es-AR")}
                              </p>
                            </div>
                            <Badge variant={pet.is_lost ? "destructive" : "default"}>
                              {pet.is_lost ? "Perdido" : "Seguro"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-16" onClick={() => router.push("/report")}>
                <div className="text-center">
                  <div className="text-xl mb-1">📝</div>
                  <div className="text-sm">Reportar Mascota</div>
                </div>
              </Button>
              <Button variant="outline" className="h-16" onClick={() => router.push("/search")}>
                <div className="text-center">
                  <div className="text-xl mb-1">🔍</div>
                  <div className="text-sm">Buscar Mascotas</div>
                </div>
              </Button>
              <Button variant="outline" className="h-16" onClick={() => router.push("/settings")}>
                <div className="text-center">
                  <div className="text-xl mb-1">⚙️</div>
                  <div className="text-sm">Configuración</div>
                </div>
              </Button>
              <Button variant="outline" className="h-16" onClick={() => router.push("/subscription")}>
                <div className="text-center">
                  <div className="text-xl mb-1">💎</div>
                  <div className="text-sm">Suscripción</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
