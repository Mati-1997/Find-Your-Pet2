"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Search, PlusCircle, Bell, User, Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoogleMap from "@/components/google-map"
import AlertSummary from "@/components/alert-summary"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { petService } from "@/lib/supabase/pets"
import { locationService } from "@/lib/supabase/locations"

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface PetWithLocation {
  id: string
  name: string
  breed: string
  status: string
  is_lost: boolean
  latitude?: number
  longitude?: number
  timestamp?: string
}

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()
  const [pets, setPets] = useState<PetWithLocation[]>([])
  const [activeTab, setActiveTab] = useState("map")
  const [searchQuery, setSearchQuery] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState<PetWithLocation[]>([])
  const [loadingPets, setLoadingPets] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Load pets and their locations
  useEffect(() => {
    async function loadPetsData() {
      if (!user) return

      try {
        setLoadingPets(true)

        // Get all lost pets (public data)
        const lostPets = await petService.getLostPets()

        // Get locations for each pet
        const petsWithLocations = await Promise.all(
          lostPets.map(async (pet) => {
            try {
              const location = await locationService.getLatestPetLocation(pet.id)
              return {
                ...pet,
                latitude: location?.latitude,
                longitude: location?.longitude,
                timestamp: location?.timestamp,
              }
            } catch (error) {
              console.error(`Error loading location for pet ${pet.id}:`, error)
              return pet
            }
          }),
        )

        setPets(petsWithLocations)
        setFilteredLocations(petsWithLocations)
      } catch (error) {
        console.error("Error loading pets:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las mascotas",
          variant: "destructive",
        })
      } finally {
        setLoadingPets(false)
      }
    }

    loadPetsData()
  }, [user, toast])

  const handlePetClick = (petId: string) => {
    router.push(`/pet-detail?id=${petId}`)
  }

  const handleMapMarkerClick = (pet: PetWithLocation) => {
    router.push(`/pet-detail?id=${pet.id}`)
  }

  // Handle voice search
  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = "es-ES"
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      setIsListening(true)

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript
        setSearchQuery(speechResult)
        setIsListening(false)
        filterResults(speechResult)
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      toast({
        title: "No disponible",
        description: "La búsqueda por voz no está disponible en este navegador.",
        duration: 3000,
      })
    }
  }

  // Filter results based on search query
  const filterResults = (query: string) => {
    if (!query.trim()) {
      setFilteredLocations(pets)
      return
    }

    const filtered = pets.filter(
      (pet) =>
        pet.name.toLowerCase().includes(query.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(query.toLowerCase()) ||
        pet.status.toLowerCase().includes(query.toLowerCase()),
    )

    setFilteredLocations(filtered)
  }

  // Update filtered results when search query changes
  useEffect(() => {
    filterResults(searchQuery)
  }, [searchQuery, pets])

  if (loading || !user) {
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex flex-col items-center h-auto px-4 py-2">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-primary">Find Your Pet</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/alerts")}>
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-md mt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar mascota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 py-2 w-full rounded-full border-2 border-gray-800"
              />
              {searchQuery ? (
                <X
                  className="absolute right-3 text-gray-400 h-4 w-4 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              ) : (
                <Mic className="absolute right-3 text-gray-400 h-4 w-4 cursor-pointer" onClick={handleVoiceSearch} />
              )}
            </div>
            {isListening && (
              <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg p-2 text-center text-sm">
                Escuchando... Habla ahora
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        {/* Hero Section */}
        <section className="mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-2">Encuentra a tu mascota</h2>
              <p className="mb-4">Múltiples tecnologías para localizar mascotas extraviadas</p>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => router.push("/report")}
                >
                  Reportar mascota
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                  onClick={() => router.push("/ai-recognition")}
                >
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alert Summary */}
        <section className="mb-8">
          <AlertSummary />
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="mt-4">
            <div className="rounded-lg h-64 overflow-hidden">
              {filteredLocations.filter((pet) => pet.latitude && pet.longitude).length > 0 ? (
                <GoogleMap
                  petLocations={filteredLocations.filter((pet) => pet.latitude && pet.longitude)}
                  height="100%"
                  width="100%"
                  onMarkerClick={handleMapMarkerClick}
                  initialCenter={{
                    lat: 19.4326, // Ciudad de México
                    lng: -99.1332,
                  }}
                  initialZoom={12}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-gray-500">No hay ubicaciones disponibles</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <div className="space-y-4">
              {loadingPets ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Cargando mascotas...</p>
                </div>
              ) : filteredLocations.length > 0 ? (
                filteredLocations.map((pet) => (
                  <Card
                    key={pet.id}
                    className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handlePetClick(pet.id)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-24 h-24 bg-gray-300 flex-shrink-0"></div>
                        <div className="p-4">
                          <h3 className="font-medium">{pet.name}</h3>
                          <p className="text-sm text-gray-500">
                            {pet.breed} • {pet.is_lost ? "Perdido" : "Encontrado"}
                          </p>
                          {pet.timestamp && (
                            <p className="text-sm text-gray-500">Visto hace {getTimeAgo(pet.timestamp)}</p>
                          )}
                          <div className="flex items-center mt-2 text-xs text-blue-600">
                            <MapPin className="w-3 h-3 mr-1" />
                            Ver ubicación
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No se encontraron resultados para "{searchQuery}"</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Métodos de localización */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Métodos de localización</h2>
          <div className="grid grid-cols-2 gap-4">
            <MethodCard
              title="GPS"
              icon="🛰️"
              description="Collar inteligente con rastreo GPS"
              onClick={() => router.push("/tracking")}
            />
            <MethodCard
              title="IA"
              icon="🤖"
              description="Reconocimiento facial con IA"
              onClick={() => router.push("/ai-recognition")}
            />
            <MethodCard
              title="Fotos"
              icon="📸"
              description="Comparación de fotos"
              onClick={() => router.push("/ai-recognition?tab=upload")}
            />
            <MethodCard
              title="Huella nasal"
              icon="👃"
              description="Identificación única"
              onClick={() => router.push("/ai-recognition?tab=nose")}
            />
            <MethodCard
              title="NFC"
              icon="📱"
              description="Escaneo de chip NFC"
              onClick={() => router.push("/tracking?tab=devices")}
            />
            <MethodCard
              title="Redes"
              icon="📢"
              description="Redes sociales y carteles"
              onClick={() => router.push("/report")}
            />
            <MethodCard
              title="Bluetooth"
              icon="📶"
              description="Seguimiento de corto alcance"
              onClick={() => router.push("/tracking?tab=devices")}
            />
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white border-t">
        <div className="grid grid-cols-4 h-16">
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => router.push("/ai-recognition")}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Buscar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => router.push("/tracking")}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs mt-1">Mapa</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none text-primary"
            onClick={() => router.push("/report")}
          >
            <PlusCircle className="w-5 h-5 text-primary" />
            <span className="text-xs mt-1">Reportar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => router.push("/profile")}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Perfil</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}

function MethodCard({
  title,
  icon,
  description,
  onClick,
}: {
  title: string
  icon: string
  description: string
  onClick: () => void
}) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className="text-2xl mr-3">{icon}</div>
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Función para calcular tiempo transcurrido
function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()

  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  return `${days}d`
}
