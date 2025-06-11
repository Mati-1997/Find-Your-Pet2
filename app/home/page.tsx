"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Search, PlusCircle, User, Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

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
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pets, setPets] = useState<PetWithLocation[]>([])
  const [activeTab, setActiveTab] = useState("map")
  const [searchQuery, setSearchQuery] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState<PetWithLocation[]>([])

  // Verificar autenticación
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
          router.push("/login")
          return
        }

        if (!session) {
          router.push("/login")
          return
        }

        setUser(session.user)

        // Datos de ejemplo para mostrar
        const examplePets: PetWithLocation[] = [
          {
            id: "1",
            name: "Max",
            breed: "Golden Retriever",
            status: "Perdido",
            is_lost: true,
            latitude: 19.4326,
            longitude: -99.1332,
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Luna",
            breed: "Gato Persa",
            status: "Encontrado",
            is_lost: false,
            latitude: 19.44,
            longitude: -99.13,
            timestamp: new Date().toISOString(),
          },
        ]

        setPets(examplePets)
        setFilteredLocations(examplePets)
      } catch (error) {
        console.error("Error in auth check:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handlePetClick = (petId: string) => {
    toast({
      title: "Navegando",
      description: `Viendo detalles de mascota ${petId}`,
    })
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
        pet.status.toLowerCase().includes(query.toLowerCase()),
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
                  onClick={() => toast({ title: "Navegando", description: "Ir a reportar mascota" })}
                >
                  Reportar mascota
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                  onClick={() => toast({ title: "Navegando", description: "Ir a reconocimiento IA" })}
                >
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alert Summary */}
        <section className="mb-8">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Resumen de Alertas</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-gray-600">Perdidas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-sm text-gray-600">Encontradas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-sm text-gray-600">Activas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="mt-4">
            <div className="rounded-lg h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Mapa de mascotas</p>
                <p className="text-sm text-gray-400">{filteredLocations.length} mascotas en el área</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <div className="space-y-4">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((pet) => (
                  <Card
                    key={pet.id}
                    className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handlePetClick(pet.id)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-24 h-24 bg-gray-300 flex-shrink-0 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Foto</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{pet.name}</h3>
                          <p className="text-sm text-gray-500">
                            {pet.breed} • {pet.is_lost ? "Perdido" : "Encontrado"}
                          </p>
                          <p className="text-sm text-gray-500">Visto recientemente</p>
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
              onClick={() => toast({ title: "GPS", description: "Función de rastreo GPS" })}
            />
            <MethodCard
              title="IA"
              icon="🤖"
              description="Reconocimiento facial con IA"
              onClick={() => toast({ title: "IA", description: "Reconocimiento con inteligencia artificial" })}
            />
            <MethodCard
              title="Fotos"
              icon="📸"
              description="Comparación de fotos"
              onClick={() => toast({ title: "Fotos", description: "Comparación de fotografías" })}
            />
            <MethodCard
              title="Huella nasal"
              icon="👃"
              description="Identificación única"
              onClick={() => toast({ title: "Huella nasal", description: "Identificación por huella nasal" })}
            />
            <MethodCard
              title="NFC"
              icon="📱"
              description="Escaneo de chip NFC"
              onClick={() => toast({ title: "NFC", description: "Escaneo de chip NFC" })}
            />
            <MethodCard
              title="Redes"
              icon="📢"
              description="Redes sociales y carteles"
              onClick={() => toast({ title: "Redes", description: "Difusión en redes sociales" })}
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
            onClick={() => toast({ title: "Buscar", description: "Función de búsqueda" })}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Buscar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => toast({ title: "Mapa", description: "Ver mapa completo" })}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs mt-1">Mapa</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none text-primary"
            onClick={() => toast({ title: "Reportar", description: "Reportar mascota perdida" })}
          >
            <PlusCircle className="w-5 h-5 text-primary" />
            <span className="text-xs mt-1">Reportar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none"
            onClick={() => toast({ title: "Perfil", description: "Ver perfil de usuario" })}
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
