"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Search, PlusCircle, User, Mic, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import MapView from "@/components/map-view"
import AlertSummary from "@/components/alert-summary"

interface PetWithLocation {
  id: string
  name: string
  breed: string
  status: string
  is_lost: boolean
  latitude?: number
  longitude?: number
  timestamp?: string
  image_url?: string
  description?: string
  owner_id?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pets, setPets] = useState<PetWithLocation[]>([])
  const [activeTab, setActiveTab] = useState("map")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLocations, setFilteredLocations] = useState<PetWithLocation[]>([])
  const [userLocation, setUserLocation] = useState({ lat: -34.6037, lng: -58.3816 }) // Buenos Aires

  // Verificar autenticación y cargar datos
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error checking session:", error)
          toast({
            title: "Error de autenticación",
            description: "Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        if (!session) {
          console.log("No session found, redirecting to login")
          router.push("/login")
          return
        }

        console.log("User authenticated successfully:", session.user.id)
        setUser(session.user)
        await loadPetsFromDatabase()
        await getUserLocation()
      } catch (error) {
        console.error("Error in auth check:", error)
        toast({
          title: "Error de conexión",
          description: "Verifica tu conexión a internet.",
          variant: "destructive",
        })
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
          console.log("Error getting location, using Buenos Aires default:", error)
          // Mantener Buenos Aires como default
        },
      )
    }
  }

  const loadPetsFromDatabase = async () => {
    try {
      const supabase = createClient()
      const { data: petsData, error } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading pets:", error)
        // En lugar de mostrar array vacío, mostrar datos de ejemplo para testing
        const examplePets: PetWithLocation[] = [
          {
            id: "example-1",
            name: "Max",
            breed: "Golden Retriever",
            status: "Perdido",
            is_lost: true,
            latitude: userLocation.lat + 0.005,
            longitude: userLocation.lng + 0.005,
            timestamp: new Date().toISOString(),
            description: "Perro dorado, muy amigable, collar azul",
          },
          {
            id: "example-2",
            name: "Luna",
            breed: "Mestizo",
            status: "Encontrado",
            is_lost: false,
            latitude: userLocation.lat - 0.003,
            longitude: userLocation.lng + 0.002,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            description: "Gata blanca con manchas negras",
          },
        ]
        setPets(examplePets)
        setFilteredLocations(examplePets)

        toast({
          title: "Usando datos de ejemplo",
          description: "No se pudo conectar a la base de datos. Mostrando datos de prueba.",
        })
        return
      }

      if (petsData && petsData.length > 0) {
        const formattedPets: PetWithLocation[] = petsData.map((pet) => ({
          id: pet.id,
          name: pet.name,
          breed: pet.breed || "Raza desconocida",
          status: pet.is_lost ? "Perdido" : "Encontrado",
          is_lost: pet.is_lost,
          latitude: pet.last_known_latitude || userLocation.lat + (Math.random() - 0.5) * 0.01,
          longitude: pet.last_known_longitude || userLocation.lng + (Math.random() - 0.5) * 0.01,
          timestamp: pet.created_at,
          image_url: pet.image_url,
          description: pet.description,
          owner_id: pet.owner_id,
        }))

        setPets(formattedPets)
        setFilteredLocations(formattedPets)
      } else {
        // Si no hay datos reales, mostrar datos de ejemplo
        const examplePets: PetWithLocation[] = [
          {
            id: "example-1",
            name: "Max",
            breed: "Golden Retriever",
            status: "Perdido",
            is_lost: true,
            latitude: userLocation.lat + 0.005,
            longitude: userLocation.lng + 0.005,
            timestamp: new Date().toISOString(),
            description: "Perro dorado, muy amigable, collar azul",
          },
        ]
        setPets(examplePets)
        setFilteredLocations(examplePets)
      }
    } catch (error) {
      console.error("Error loading pets:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar las mascotas. Verifica tu conexión.",
        variant: "destructive",
      })
      setPets([])
      setFilteredLocations([])
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handlePetClick = (pet: PetWithLocation) => {
    router.push(`/pet-detail?id=${pet.id}`)
  }

  const handleVoiceSearch = () => {
    toast({
      title: "Búsqueda por voz",
      description: "Función de búsqueda por voz activada",
    })
  }

  const filterResults = (query: string) => {
    if (!query.trim()) {
      setFilteredLocations(pets)
      return
    }

    const filtered = pets.filter(
      (pet) =>
        pet.name.toLowerCase().includes(query.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(query.toLowerCase()) ||
        pet.description?.toLowerCase().includes(query.toLowerCase()),
    )

    setFilteredLocations(filtered)
  }

  useEffect(() => {
    filterResults(searchQuery)
  }, [searchQuery, pets])

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex flex-col items-center h-auto px-4 py-2">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-primary">Find Your Pet</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/settings")}>
                <Settings className="w-4 h-4 mr-1" />
                Configuración
              </Button>
              <span className="text-sm text-gray-600">Hola, {user?.user_metadata?.full_name || user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Cerrar Sesión
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6 pb-20">
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
                  onClick={() => router.push("/search")}
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
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <MapView
                petLocations={filteredLocations.map((pet) => ({
                  id: pet.id,
                  name: pet.name,
                  latitude: pet.latitude || userLocation.lat,
                  longitude: pet.longitude || userLocation.lng,
                  timestamp: pet.timestamp || new Date().toISOString(),
                  status: pet.is_lost ? "lost" : "found",
                  imageUrl: pet.image_url,
                }))}
                height="400px"
                onMarkerClick={handlePetClick}
                initialViewState={{
                  latitude: userLocation.lat,
                  longitude: userLocation.lng,
                  zoom: 13,
                }}
              />
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium mb-2">Mapa no disponible</h3>
                  <p className="text-sm text-gray-500">
                    Configure la API key de Google Maps en las variables de entorno
                  </p>
                  <p className="text-xs text-gray-400 mt-2">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <div className="space-y-4">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((pet) => (
                  <Card
                    key={pet.id}
                    className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handlePetClick(pet)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-24 h-24 bg-gray-300 flex-shrink-0 flex items-center justify-center">
                          {pet.image_url ? (
                            <img
                              src={pet.image_url || "/placeholder.svg"}
                              alt={pet.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.nextElementSibling!.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <span className="text-gray-500 text-xs">🐕</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{pet.name}</h3>
                          <p className="text-sm text-gray-500">
                            {pet.breed} • {pet.status}
                          </p>
                          <p className="text-sm text-gray-500">{pet.description}</p>
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
                  <p>No hay mascotas reportadas</p>
                  <p className="text-sm mt-2">Sé el primero en reportar una mascota perdida</p>
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
              title="Fotos"
              icon="📸"
              description="Comparación de fotos"
              onClick={() => router.push("/search")}
            />
            <MethodCard
              title="Huella nasal"
              icon="👃"
              description="Identificación única"
              onClick={() =>
                toast({ title: "Huella nasal", description: "Función en desarrollo - Próximamente disponible" })
              }
            />
            <MethodCard
              title="Redes"
              icon="📢"
              description="Redes sociales y carteles"
              onClick={() => toast({ title: "Redes", description: "Función en desarrollo - Próximamente disponible" })}
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
            onClick={() => router.push("/search")}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Buscar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => {
              setActiveTab("map")
              // Scroll to map section
              document.querySelector('[data-state="active"]')?.scrollIntoView({ behavior: "smooth" })
            }}
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
