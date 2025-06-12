"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Camera, Upload, Filter, MapPin, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function SearchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    distance: "all",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        loadSearchResults()
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadSearchResults = async () => {
    try {
      const supabase = createClient()
      const { data: petsData, error } = await supabase
        .from("pets")
        .select("*")
        .eq("is_lost", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading pets:", error)
        setSearchResults([])
        return
      }

      if (petsData && petsData.length > 0) {
        const formattedResults = petsData.map((pet) => ({
          id: pet.id,
          name: pet.name,
          breed: pet.breed || "Raza desconocida",
          status: pet.is_lost ? "Perdido" : "Encontrado",
          location: "Buenos Aires, Argentina", // Placeholder
          distance: "2.3 km", // Placeholder
          time: "hace 3 horas", // Placeholder
          image: pet.image_url || "/placeholder.svg?height=100&width=100",
        }))
        setSearchResults(formattedResults)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error loading search results:", error)
      setSearchResults([])
    }
  }

  const handleSearch = () => {
    toast({
      title: "Buscando",
      description: `Buscando "${searchQuery}" en la base de datos...`,
    })
    // Aquí iría la lógica real de búsqueda
  }

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast({
        title: "Imagen seleccionada",
        description: `Procesando imagen: ${file.name}`,
      })
      // Aquí iría la lógica de procesamiento de imagen
    }
  }

  const handleCameraSearch = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          toast({
            title: "Cámara activada",
            description: "Función de cámara en desarrollo",
          })
          // Detener el stream inmediatamente para este demo
          stream.getTracks().forEach((track) => track.stop())
        })
        .catch((error) => {
          toast({
            title: "Error de cámara",
            description: "No se pudo acceder a la cámara",
            variant: "destructive",
          })
        })
    } else {
      toast({
        title: "Cámara no disponible",
        description: "Tu dispositivo no soporta acceso a cámara",
        variant: "destructive",
      })
    }
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
          <h1 className="text-lg font-semibold">Buscar Mascotas</h1>
          <div className="ml-auto">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <Home className="w-5 h-5 mr-2" />
              Inicio
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, raza, color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col" onClick={handleCameraSearch}>
                <Camera className="w-6 h-6 mb-2" />
                <span className="text-sm">Tomar Foto</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={handleImageUpload}>
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-sm">Subir Imagen</span>
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer">
                Todos los tipos
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Perros
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Gatos
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Perdidos
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Encontrados
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Cerca de mí
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((pet) => (
                  <Card
                    key={pet.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => router.push(`/pet-detail?id=${pet.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 text-sm">🐕</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{pet.name}</h3>
                              <p className="text-sm text-gray-600">{pet.breed}</p>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {pet.location} • {pet.distance}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{pet.time}</p>
                            </div>
                            <Badge variant={pet.status === "Perdido" ? "destructive" : "default"}>{pet.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No hay mascotas reportadas</p>
                <p className="text-sm mt-2">Sé el primero en reportar una mascota</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
