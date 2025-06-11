"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Heart, AlertTriangle, Upload, X, CheckCircle, User, PawPrint } from "lucide-react"
import { useAuthCheck } from "@/hooks/use-auth-check"
import { createClient } from "@/lib/supabase/client"
import { activityService } from "@/lib/activity-service"

export default function Report() {
  const router = useRouter()
  const { user, loading } = useAuthCheck()
  const [reportType, setReportType] = useState<"lost" | "found" | "">("")
  const [formData, setFormData] = useState({
    petName: "",
    petType: "",
    breed: "",
    color: "",
    size: "",
    age: "",
    description: "",
    lastSeenLocation: "",
    lastSeenDate: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    reward: "",
  })
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newImages].slice(0, 5)) // Máximo 5 imágenes
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validación básica
      if (!formData.petName && reportType === "lost") {
        throw new Error("El nombre de la mascota es requerido para reportes de pérdida")
      }
      if (!formData.color || !formData.description || !formData.lastSeenLocation || !formData.lastSeenDate) {
        throw new Error("Por favor completa todos los campos requeridos")
      }
      if (!formData.contactName || !formData.contactPhone || !formData.contactEmail) {
        throw new Error("La información de contacto es requerida")
      }

      // Crear el objeto de mascota para guardar en la base de datos
      const petData = {
        name: formData.petName || "Sin nombre",
        species: formData.petType || "otro",
        breed: formData.breed || "Desconocida",
        color: formData.color,
        size: formData.size || "mediano",
        age: formData.age || "Desconocida",
        description: formData.description,
        is_lost: reportType === "lost",
        last_seen_location: formData.lastSeenLocation,
        last_seen_date: formData.lastSeenDate,
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        reward: formData.reward || null,
        owner_id: user?.id,
        user_id: user?.id, // Agregar también user_id por compatibilidad
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Guardando mascota:", petData)

      // Guardar en la base de datos
      const supabase = createClient()
      const { data: savedPet, error } = await supabase.from("pets").insert([petData]).select().single()

      if (error) {
        console.error("Error al guardar la mascota:", error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      console.log("Mascota guardada exitosamente:", savedPet)

      // Registrar la actividad
      if (user?.id) {
        const activityType = reportType === "lost" ? "pet_lost" : "pet_found"
        const activityDescription =
          reportType === "lost"
            ? `Reportaste a ${formData.petName || "una mascota"} como perdido`
            : `Reportaste haber encontrado a ${formData.petName || "una mascota"}`

        const activityResult = await activityService.createActivity({
          user_id: user.id,
          type: activityType as any,
          description: activityDescription,
          points: 50,
          metadata: {
            pet_id: savedPet.id,
            pet_name: formData.petName || "Sin nombre",
            pet_type: formData.petType || "otro",
            location: formData.lastSeenLocation,
            report_type: reportType,
          },
        })

        console.log("Resultado de actividad:", activityResult)
      }

      // Subir imágenes si hay
      if (images.length > 0 && savedPet?.id) {
        console.log("Subiendo imágenes...")
        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          const fileExt = image.name.split(".").pop()
          const fileName = `${savedPet.id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `pet-images/${fileName}`

          const { error: uploadError } = await supabase.storage.from("pets").upload(filePath, image)

          if (uploadError) {
            console.error("Error al subir imagen:", uploadError)
            // Continuamos aunque falle la subida de imágenes
          } else {
            console.log("Imagen subida:", filePath)
            // Actualizar la mascota con la URL de la imagen (solo la primera)
            if (i === 0) {
              const { data: publicURL } = supabase.storage.from("pets").getPublicUrl(filePath)
              if (publicURL) {
                await supabase.from("pets").update({ image_url: publicURL.publicUrl }).eq("id", savedPet.id)
              }
            }
          }
        }
      }

      // Solo establecer success como true si todo salió bien
      setSuccess(true)
      console.log("Reporte completado exitosamente")
    } catch (error) {
      console.error("Error en el proceso de reporte:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar el reporte"
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Agregar useEffect para manejar la redirección
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/dashboard")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4 w-20 h-20 mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Reporte Enviado!</h2>
            <p className="text-gray-600 mb-6">
              Tu reporte ha sido publicado exitosamente. La comunidad ya está ayudando a buscar.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Volver al Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push("/search")} className="w-full">
                Ver Reportes Activos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/20">
              ← Volver
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Reportar Mascota</h1>
              <p className="text-pink-100">Ayuda a reunir familias</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Selector de tipo de reporte */}
        {!reportType && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                  ¿Qué tipo de reporte quieres hacer?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Button
                    onClick={() => setReportType("lost")}
                    className="h-32 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-xl font-bold mb-2">Mascota Perdida</h3>
                      <p className="text-red-100 text-sm">Mi mascota se perdió y necesito ayuda para encontrarla</p>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setReportType("found")}
                    className="h-32 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center">
                      <Heart className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-xl font-bold mb-2">Mascota Encontrada</h3>
                      <p className="text-green-100 text-sm">
                        Encontré una mascota y quiero ayudar a reunirla con su familia
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Formulario de reporte */}
        {reportType && (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader
                className={`${reportType === "lost" ? "bg-gradient-to-r from-red-500 to-pink-500" : "bg-gradient-to-r from-green-500 to-emerald-500"} text-white rounded-t-lg`}
              >
                <CardTitle className="flex items-center text-xl">
                  {reportType === "lost" ? (
                    <>
                      <AlertTriangle className="w-6 h-6 mr-2" />
                      Reportar Mascota Perdida
                    </>
                  ) : (
                    <>
                      <Heart className="w-6 h-6 mr-2" />
                      Reportar Mascota Encontrada
                    </>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-white/20 text-white">{reportType === "lost" ? "Perdida" : "Encontrada"}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportType("")}
                    className="text-white hover:bg-white/20"
                  >
                    Cambiar tipo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Información de la mascota */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <PawPrint className="w-5 h-5 mr-2 text-blue-500" />
                      Información de la Mascota
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="petName" className="text-gray-700 font-medium">
                          Nombre de la mascota
                        </Label>
                        <Input
                          id="petName"
                          placeholder={reportType === "lost" ? "Ej: Max, Luna..." : "Si lo conoces"}
                          value={formData.petName}
                          onChange={(e) => handleInputChange("petName", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                          required={reportType === "lost"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="petType" className="text-gray-700 font-medium">
                          Tipo de mascota
                        </Label>
                        <Select value={formData.petType} onValueChange={(value) => handleInputChange("petType", value)}>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="Selecciona el tipo" />
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

                      <div className="space-y-2">
                        <Label htmlFor="breed" className="text-gray-700 font-medium">
                          Raza
                        </Label>
                        <Input
                          id="breed"
                          placeholder="Ej: Golden Retriever, Mestizo..."
                          value={formData.breed}
                          onChange={(e) => handleInputChange("breed", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="color" className="text-gray-700 font-medium">
                          Color
                        </Label>
                        <Input
                          id="color"
                          placeholder="Ej: Marrón, Negro, Blanco..."
                          value={formData.color}
                          onChange={(e) => handleInputChange("color", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="size" className="text-gray-700 font-medium">
                          Tamaño
                        </Label>
                        <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="Selecciona el tamaño" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="muy-pequeno">Muy pequeño (menos de 5kg)</SelectItem>
                            <SelectItem value="pequeno">Pequeño (5-15kg)</SelectItem>
                            <SelectItem value="mediano">Mediano (15-30kg)</SelectItem>
                            <SelectItem value="grande">Grande (30-50kg)</SelectItem>
                            <SelectItem value="muy-grande">Muy grande (más de 50kg)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-gray-700 font-medium">
                          Edad aproximada
                        </Label>
                        <Input
                          id="age"
                          placeholder="Ej: 2 años, Cachorro, Adulto..."
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-700 font-medium">
                        Descripción detallada
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe características distintivas, comportamiento, collar, etc..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="min-h-24 border-gray-200 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Ubicación y fecha */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-500" />
                      Ubicación y Fecha
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-gray-700 font-medium">
                          {reportType === "lost" ? "Última ubicación vista" : "Ubicación donde la encontraste"}
                        </Label>
                        <Input
                          id="location"
                          placeholder="Ej: Parque Centenario, Palermo..."
                          value={formData.lastSeenLocation}
                          onChange={(e) => handleInputChange("lastSeenLocation", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-gray-700 font-medium">
                          {reportType === "lost" ? "Fecha que se perdió" : "Fecha que la encontraste"}
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.lastSeenDate}
                          onChange={(e) => handleInputChange("lastSeenDate", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fotos */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-purple-500" />
                      Fotografías
                    </h3>

                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 mb-2">Haz clic para subir fotos o arrastra aquí</p>
                          <p className="text-sm text-gray-500">Máximo 5 imágenes (JPG, PNG)</p>
                        </label>
                      </div>

                      {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(image) || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg shadow-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <User className="w-5 h-5 mr-2 text-orange-500" />
                      Información de Contacto
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactName" className="text-gray-700 font-medium">
                          Nombre completo
                        </Label>
                        <Input
                          id="contactName"
                          placeholder="Tu nombre"
                          value={formData.contactName}
                          onChange={(e) => handleInputChange("contactName", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPhone" className="text-gray-700 font-medium">
                          Teléfono
                        </Label>
                        <Input
                          id="contactPhone"
                          placeholder="+54 11 1234-5678"
                          value={formData.contactPhone}
                          onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="text-gray-700 font-medium">
                          Email
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="tu@email.com"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recompensa (solo para perdidas) */}
                  {reportType === "lost" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-pink-500" />
                        Recompensa (Opcional)
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="reward" className="text-gray-700 font-medium">
                          Monto de recompensa
                        </Label>
                        <Input
                          id="reward"
                          placeholder="Ej: $10,000 - Solo si deseas ofrecer recompensa"
                          value={formData.reward}
                          onChange={(e) => handleInputChange("reward", e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 h-12">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 h-12 ${reportType === "lost" ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Enviando reporte...
                        </div>
                      ) : (
                        `Publicar Reporte ${reportType === "lost" ? "de Pérdida" : "de Encuentro"}`
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
