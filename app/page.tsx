"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { redirect } from "next/navigation"
import { MapPin, Search, PlusCircle, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaticMap from "@/components/static-map"
import { getSamplePetLocations } from "@/lib/location-service"
import AlertSummary from "@/components/alert-summary"

export default function Home() {
  const router = useRouter()
  const petLocations = getSamplePetLocations()
  const [activeTab, setActiveTab] = useState("map")

  redirect("/login")
  return null

  const handlePetClick = (petId: string) => {
    router.push(`/pet-detail?id=${petId}`)
  }

  const handleMapMarkerClick = (pet) => {
    router.push(`/pet-detail?id=${pet.id}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-primary">PetFinder</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/alerts")}>
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
              <User className="w-5 h-5" />
            </Button>
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
              <StaticMap petLocations={petLocations} height="100%" width="100%" onMarkerClick={handleMapMarkerClick} />
            </div>
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <div className="space-y-4">
              {petLocations.map((pet) => (
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
                          Visto hace {getTimeAgo(pet.timestamp)} • {getDistance(pet.latitude, pet.longitude)}km
                        </p>
                        <div className="flex items-center mt-2 text-xs text-blue-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          Ver ubicación
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

function MethodCard({ title, icon, description, onClick }) {
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

// Función simple para simular distancia
function getDistance(lat: number, lon: number): string {
  // En una app real, calcularíamos la distancia real
  return (Math.random() * 5).toFixed(1)
}
