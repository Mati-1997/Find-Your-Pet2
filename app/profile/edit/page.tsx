"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuthCheck } from "@/hooks/use-auth-check"

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading, isAuthenticated } = useAuthCheck()
  const [saving, setSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    bio: "",
  })

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast({
          title: "Inicia sesión",
          description: "Necesitas iniciar sesión para editar tu perfil",
          variant: "destructive",
        })
        router.push("/login")
      } else if (user) {
        loadUserProfile()
      }
    }
  }, [loading, isAuthenticated, user, router])

  const loadUserProfile = async () => {
    try {
      const supabase = createClient()
      const { data: profile, error } = await supabase.from("users").select("*").eq("id", user?.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
        return
      }

      setUserProfile(profile)
      setFormData({
        full_name: profile?.full_name || user?.user_metadata?.full_name || "",
        phone: profile?.phone || user?.user_metadata?.phone || "",
        location: user?.user_metadata?.location || "Buenos Aires, Argentina",
        bio: user?.user_metadata?.bio || "",
      })
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      // Actualizar auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
        },
      })

      if (authError) throw authError

      // Actualizar tabla users
      const { error: profileError } = await supabase.from("users").upsert({
        id: user?.id,
        email: user?.email,
        full_name: formData.full_name,
        phone: formData.phone,
        avatar_url: userProfile?.avatar_url,
      })

      if (profileError) throw profileError

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 2MB",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()

      // Upload to storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user?.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from("user-avatars").getPublicUrl(fileName)

      // Update both auth metadata and users table
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl },
      })

      if (authError) throw authError

      const { error: profileError } = await supabase.from("users").upsert({
        id: user?.id,
        email: user?.email,
        full_name: formData.full_name,
        phone: formData.phone,
        avatar_url: data.publicUrl,
      })

      if (profileError) throw profileError

      setUserProfile({ ...userProfile, avatar_url: data.publicUrl })

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente",
      })
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGoBack = () => {
    if (document.referrer && document.referrer.includes(window.location.origin)) {
      router.back()
    } else {
      router.push("/dashboard")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleGoBack} className="text-white hover:bg-white/20 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Editar Perfil</h1>
                <p className="text-blue-100">Actualiza tu información personal</p>
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
            {/* Profile Picture */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Foto de perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url || "/placeholder.svg"}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <User className={`w-12 h-12 text-white ${userProfile?.avatar_url ? "hidden" : ""}`} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mb-2"
                      onClick={() => document.getElementById("avatar-upload")?.click()}
                      disabled={saving}
                    >
                      {saving ? "Subiendo..." : "Cambiar foto"}
                    </Button>
                    <p className="text-sm text-gray-500">JPG, PNG o GIF. Máximo 2MB.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tu foto ayuda a otros usuarios a reconocerte en la comunidad
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información personal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Tu nombre completo"
                        className="pl-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="pl-9 bg-gray-50 border-gray-200 text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">El email no se puede cambiar por seguridad</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+54 11 1234-5678"
                        className="pl-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                      Ubicación
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ciudad, País"
                        className="pl-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                    Biografía
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Cuéntanos un poco sobre ti y tu experiencia con mascotas..."
                    rows={4}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500">Una buena biografía ayuda a otros usuarios a conocerte mejor</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoBack}
                className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
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
