"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Layers, ZoomIn, ZoomOut, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaticMap from "@/components/static-map"
import LocationHistory from "@/components/location-history"
import { getPetLocationHistory } from "@/lib/location-service"

export default function TrackingPage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [zoom, setZoom] = useState(13)

  const petLocations = getPetLocationHistory("1")

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Link href="/home" className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Rastreo en vivo</h1>
          <div className="ml-auto">
            <Badge className="bg-green-500">En línea</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Map */}
        <div className="absolute inset-0">
          <StaticMap
            petLocations={petLocations}
            height="100%"
            width="100%"
            initialZoom={zoom}
            onMarkerClick={handleLocationSelect}
          />
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => setZoom((prev) => Math.min(prev + 1, 20))}
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => setZoom((prev) => Math.max(prev - 1, 1))}
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
            <Layers className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    console.log("Current position:", position.coords)
                    // En una implementación real, actualizaríamos el centro del mapa
                  },
                  (error) => {
                    console.error("Error getting current position:", error)
                  },
                )
              }
            }}
          >
            <Target className="w-5 h-5" />
          </Button>
        </div>

        {/* Bottom Sheet */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-2"></div>

          <Tabs defaultValue="live">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="live">En vivo</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="p-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <h3 className="font-medium">Max</h3>
                      <p className="text-sm text-gray-500">Última actualización: hace 5 min</p>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Información de ubicación</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-gray-500">Distancia</div>
                      <div className="font-medium">1.2 km</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-gray-500">Velocidad</div>
                      <div className="font-medium">0 km/h</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-gray-500">Batería collar</div>
                      <div className="font-medium">85%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-gray-500">Señal</div>
                      <div className="font-medium">Fuerte</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Button className="w-full">Activar alerta de proximidad</Button>
            </TabsContent>

            <TabsContent value="history" className="p-4 space-y-4">
              <LocationHistory locations={petLocations} onLocationSelect={handleLocationSelect} />
            </TabsContent>

            <TabsContent value="devices" className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Dispositivos activos</h3>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">🛰️</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Collar GPS</h4>
                        <p className="text-xs text-gray-500">Batería: 85%</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>

                    <div className="flex items-center">
                      <div className="text-2xl mr-3">📱</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Chip NFC</h4>
                        <p className="text-xs text-gray-500">ID: #12345678</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>

                    <div className="flex items-center">
                      <div className="text-2xl mr-3">📶</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Bluetooth</h4>
                        <p className="text-xs text-gray-500">Alcance: 100m</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button variant="outline" className="w-full">
                Añadir nuevo dispositivo
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
