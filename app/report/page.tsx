"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Upload, MapPin, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function ReportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: -34.6037, lng: -58.3816 })
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    description: "",
    reportType: "lost",
    species: "dog",
    color: "",
    size: "",
    lastSeenLocation: "",
    contactPhone: "",
    reward: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        setUser(session.user)
        getUserLocation()
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Error getting location:", error)
        },
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()

      const petData = {
        name: formData.name,
        breed: formData.breed,
        description: formData.description,
        species: formData.species,
        color: formData.color,
        size: formData.size,
        is_lost: formData.reportType === "lost",
        last_known_latitude: userLocation.lat,
        last_known_longitude: userLocation.lng,
        last_seen_location: formData.lastSeenLocation,
        contact_phone: formData.contactPhone,
        reward: formData.reward,
        owner_id: user.id,
        status: "active",
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("pets").insert([petData]).select()

      if (error) {
        throw error
      }

      toast({
        title: "Reporte creado",
        description: `${formData.name} ha sido reportado como ${formData.reportType === "lost" ? "perdido" : "encontrado"}`,
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error creating report:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el reporte. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageUpload = () => {
    toast({
      title: "Función en desarrollo",
      description: "La subida de imágenes estará disponible pronto",
    })
  }

  const handleTakePhoto = () => {
    toast({
      title: "Función en desarrollo",
      description: "La función de cámara estará disponible pronto",
    })
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" className="mr-4 p-0" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Reportar Mascota</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.reportType}
                onValueChange={(value) => setFormData({ ...formData, reportType: value })}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="lost"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="lost" id="lost" className="sr-only" />
                  <div className="text-2xl mb-2">😢</div>
                  <span className="text-sm font-medium">Mascota perdida</span>
                </Label>
                <Label
                  htmlFor="found"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="found" id="found" className="sr-only" />
                  <div className="text-2xl mb-2">😊</div>
                  <span className="text-sm font-medium">Mascota encontrada</span>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Pet Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la mascota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la mascota *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Max, Luna, Rocky"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Raza</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="Ej: Golden Retriever, Mestizo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Especie</Label>
                <RadioGroup
                  value={formData.species}
                  onValueChange={(value) => setFormData({ ...formData, species: value })}
                  className="grid grid-cols-3 gap-2"
                >
                  <Label
                    htmlFor="dog"
                    className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="dog" id="dog" />
                    <span>🐕 Perro</span>
                  </Label>
                  <Label
                    htmlFor="cat"
                    className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="cat" id="cat" />
                    <span>🐱 Gato</span>
                  </Label>
                  <Label
                    htmlFor="other"
                    className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="other" id="other" />
                    <span>🐾 Otro</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Ej: Dorado, Negro, Blanco"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Tamaño</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="Ej: Pequeño, Mediano, Grande"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe características distintivas, comportamiento, etc."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="h-24" onClick={handleTakePhoto}>
                  <div className="text-center">
                    <Camera className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Tomar foto</span>
                  </div>
                </Button>
                <Button type="button" variant="outline" className="h-24" onClick={handleImageUpload}>
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Subir imagen</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lastSeenLocation">
                  {formData.reportType === "lost" ? "Última vez visto en" : "Encontrado en"}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastSeenLocation"
                    value={formData.lastSeenLocation}
                    onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                    placeholder="Ej: Parque Centenario, Palermo"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono de contacto</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+54 11 1234-5678"
                />
              </div>

              {formData.reportType === "lost" && (
                <div className="space-y-2">
                  <Label htmlFor="reward">Recompensa (opcional)</Label>
                  <Input
                    id="reward"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                    placeholder="Ej: $10,000 ARS"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            <Save className="w-4 h-4 mr-2" />
            {submitting ? "Creando reporte..." : "Crear reporte"}
          </Button>
        </form>
      </main>
    </div>
  )
}
