"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Save, Camera, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuthCheck } from "@/hooks/use-auth-check"

export default function EditPetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const petId = searchParams.get("id")
  const { toast } = useToast()
  const { user, loading, isAuthenticated } = useAuthCheck()
  const [saving, setSaving] = useState(false)
  const [pet, setPet] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    color: "",
    size: "",
    description: "",
    is_lost: false,
    last_seen_location: "",
    chip_id: "",
    image_url: "",
  })

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast({
          title: "Inicia sesión",
          description: "Necesitas iniciar sesión para editar mascotas",
          variant: "destructive",
        })
        router.push("/login")
      } else if (petId) {
        loadPetData()
      }
    }
  }, [loading, isAuthenticated, petId])

  const loadPetData = async () => {
    try {
      const supabase = createClient()
      const { data: petData, error } = await supabase.from("pets").select("*").eq("id", petId).single()

      if (error) {
        throw error
      }

      if (petData.owner_id !== user?.id && petData.user_id !== user?.id) {
        toast({
          title: "Error",
          description: "No tienes permisos para editar esta mascota",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      setPet(petData)
      setFormData({
        name: petData.name || "",
        species: petData.species || "",
        breed: petData.breed || "",
        age: petData.age || "",
        color: petData.color || "",
        size: petData.size || "",
        description: petData.description || "",
        is_lost: petData.is_lost || false,
        last_seen_location: petData.last_seen_location || "",
        chip_id: petData.chip_id || "",
        image_url: petData.image_url || "",
      })
    } catch (error: any) {
      console.error("Error loading pet:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la mascota",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()

      const fileExt = file.name.split(".").pop()
      const fileName = `${petId}-${Date.now()}.${fileExt}`
      const filePath = `pets/${fileName}`

      // Use upsert to overwrite if file exists
      const { error: uploadError } = await supabase.storage.from("pet-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      const { data } = supabase.storage.from("pet-images").getPublicUrl(filePath)
      console.log("Uploaded image URL:", data.publicUrl)

      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }))

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Error: " + error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("pets")
        .update({
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age: formData.age,
          color: formData.color,
          size: formData.size,
          description: formData.description,
          is_lost: formData.is_lost,
          last_seen_location: formData.last_seen_location,
          chip_id: formData.chip_id,
          image_url: formData.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", petId)

      if (error) {
        throw error
      }

      toast({
        title: "Mascota actualizada",
        description: "Los cambios se han guardado correctamente",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error updating pet:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la mascota",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/20 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Editar {pet.name}</h1>
                <p className="text-blue-100">Actualiza la información de tu mascota</p>
              </div>
            </div>
            <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-white hover:bg-white/20">
              <Home className="w-5 h-5 mr-2" />
              Inicio
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pet Image */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Foto de la mascota
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {formData.image_url ? (
                        <img
                          src={formData.image_url || "/placeholder.svg"}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-12 h-12 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="pet-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mb-2"
                      onClick={() => document.getElementById("pet-image-upload")?.click()}
                      disabled={saving}
                    >
                      {saving ? "Subiendo..." : "Cambiar foto"}
                    </Button>
                    <p className="text-sm text-gray-500">JPG, PNG o GIF. Máximo 5MB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
                <CardTitle>Información básica</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre de la mascota"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="species">Especie *</Label>
                    <Select
                      value={formData.species}
                      onValueChange={(value) => setFormData({ ...formData, species: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la especie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perro">Perro</SelectItem>
                        <SelectItem value="gato">Gato</SelectItem>
                        <SelectItem value="ave">Ave</SelectItem>
                        <SelectItem value="conejo">Conejo</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="breed">Raza</Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      placeholder="Raza de la mascota"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Edad</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Ej: 2 años, 6 meses"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Color principal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Tamaño</Label>
                    <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pequeño">Pequeño</SelectItem>
                        <SelectItem value="mediano">Mediano</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                        <SelectItem value="muy_grande">Muy Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chip_id">ID del Chip</Label>
                  <Input
                    id="chip_id"
                    value={formData.chip_id}
                    onChange={(e) => setFormData({ ...formData, chip_id: e.target.value })}
                    placeholder="Número de identificación del chip"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Características especiales, comportamiento, etc."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle>Estado actual</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_lost" className="text-base font-medium">
                      ¿Está perdida?
                    </Label>
                    <p className="text-sm text-gray-500">Activa si tu mascota está perdida</p>
                  </div>
                  <Switch
                    id="is_lost"
                    checked={formData.is_lost}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_lost: checked })}
                  />
                </div>

                {formData.is_lost && (
                  <div className="space-y-2">
                    <Label htmlFor="last_seen_location">Última ubicación vista</Label>
                    <Input
                      id="last_seen_location"
                      value={formData.last_seen_location}
                      onChange={(e) => setFormData({ ...formData, last_seen_location: e.target.value })}
                      placeholder="Dirección o descripción del lugar"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 h-12">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
