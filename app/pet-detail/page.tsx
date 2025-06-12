"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MapPin, Calendar, Phone, Mail, Heart, Edit, Share2, AlertTriangle, CheckCircle } from "lucide-react"
import { useAuthCheck } from "@/hooks/use-auth-check"

export default function PetDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const petId = searchParams.get("id")
  const { user, loading } = useAuthCheck()
  const [pet, setPet] = useState<any>(null)
  const [petLoading, setPetLoading] = useState(true)

  useEffect(() => {
    const fetchPet = async () => {
      if (!petId || !user?.id) return

      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: petData, error } = await supabase.from("pets").select("*").eq("id", petId).single()

        if (error) {
          console.error("Error fetching pet:", error)
          router.push("/dashboard")
          return
        }

        setPet(petData)
      } catch (error) {
        console.error("Error in fetchPet:", error)
        router.push("/dashboard")
      } finally {
        setPetLoading(false)
      }
    }

    fetchPet()
  }, [petId, user?.id, router])

  const handleShare = async () => {
    const shareData = {
      title: `${pet.name} - FindYourPet`,
      text: pet.is_lost
        ? `¡Ayuda a encontrar a ${pet.name}! ${pet.description}`
        : `Conoce a ${pet.name} en FindYourPet`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Enlace copiado al portapapeles")
    }
  }

  const toggleLostStatus = async () => {
    if (!pet || !user?.id) return

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { error } = await supabase
        .from("pets")
        .update({
          is_lost: !pet.is_lost,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pet.id)

      if (error) {
        console.error("Error updating pet status:", error)
        return
      }

      setPet((prev) => ({ ...prev, is_lost: !prev.is_lost }))
    } catch (error) {
      console.error("Error in toggleLostStatus:", error)
    }
  }

  if (loading || petLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando información de la mascota...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mascota no encontrada</h2>
            <p className="text-gray-600 mb-6">No se pudo encontrar la información de esta mascota.</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div
        className={`${pet.is_lost ? "bg-gradient-to-r from-red-600 to-pink-600" : "bg-gradient-to-r from-blue-600 to-indigo-600"} text-white`}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{pet.name}</h1>
                <p className="text-blue-100">{pet.breed || pet.species || "Mascota"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => router.push(`/pet-edit?id=${pet.id}`)}
              >
                <Edit className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Información principal */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 ring-4 ring-white shadow-lg">
                  <AvatarImage src={pet.image_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-4xl font-bold">
                    {pet.name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-3xl font-bold text-gray-800">{pet.name}</h2>
                  <Badge variant={pet.is_lost ? "destructive" : "default"} className="text-sm px-3 py-1">
                    {pet.is_lost ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Perdido
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Seguro
                      </>
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Especie</p>
                    <p className="font-medium">{pet.species || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Raza</p>
                    <p className="font-medium">{pet.breed || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{pet.color || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tamaño</p>
                    <p className="font-medium">{pet.size || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Edad</p>
                    <p className="font-medium">{pet.age || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registrado</p>
                    <p className="font-medium">{new Date(pet.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Descripción</p>
                  <p className="text-gray-700">{pet.description || "Sin descripción disponible"}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={toggleLostStatus}
                    className={`${
                      pet.is_lost
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                    } text-white`}
                  >
                    {pet.is_lost ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como encontrado
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Reportar como perdido
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={() => router.push(`/tracking?pet=${pet.id}`)}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Ver en mapa
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de ubicación */}
        {pet.last_seen_location && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <MapPin className="w-6 h-6 mr-2" />
                Última ubicación conocida
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <MapPin className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium text-lg">{pet.last_seen_location}</p>
                  {pet.last_seen_date && (
                    <p className="text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(pet.last_seen_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información de contacto */}
        {(pet.contact_name || pet.contact_phone || pet.contact_email) && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Phone className="w-6 h-6 mr-2" />
                Información de contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {pet.contact_name && (
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre de contacto</p>
                    <p className="font-medium">{pet.contact_name}</p>
                  </div>
                </div>
              )}

              {pet.contact_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <a href={`tel:${pet.contact_phone}`} className="font-medium text-green-600 hover:text-green-700">
                      {pet.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              {pet.contact_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${pet.contact_email}`} className="font-medium text-blue-600 hover:text-blue-700">
                      {pet.contact_email}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recompensa */}
        {pet.reward && pet.is_lost && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recompensa ofrecida</h3>
                  <p className="text-2xl font-bold text-yellow-600">{pet.reward}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
