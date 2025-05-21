"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Download, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import StaticMap from "@/components/static-map"
import ActivityChart from "@/components/activity-chart"
import MovementStats from "@/components/movement-stats"
import {
  getPetLocationHistory,
  calculateDistance,
  getPetActivityData,
  getPetMovementStats,
  type PetLocation,
} from "@/lib/location-service"

export default function LocationHistoryPage() {
  const [selectedPet, setSelectedPet] = useState("1") // ID de la mascota seleccionada
  const [locations, setLocations] = useState<PetLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<PetLocation | null>(null)
  const [zoom, setZoom] = useState(13)
  const [isStatsOpen, setIsStatsOpen] = useState(true)

  // Obtener datos de actividad
  const activityData = getPetActivityData(selectedPet)

  // Obtener estadísticas de movimiento
  const movementStats = getPetMovementStats(selectedPet)

  useEffect(() => {
    // Cargar ubicaciones de la mascota seleccionada
    const petLocations = getPetLocationHistory(selectedPet)
    setLocations(petLocations)

    // Establecer la ubicación más reciente como seleccionada
    if (petLocations.length > 0) {
      const sortedLocations = [...petLocations].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      setSelectedLocation(sortedLocations[0])
    }
  }, [selectedPet])

  // Calcular la distancia total recorrida
  const calculateTotalDistance = () => {
    if (locations.length < 2) return 0

    // Ordenar ubicaciones por timestamp
    const sortedLocations = [...locations].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    let totalDistance = 0
    for (let i = 0; i < sortedLocations.length - 1; i++) {
      totalDistance += calculateDistance(
        sortedLocations[i].latitude,
        sortedLocations[i].longitude,
        sortedLocations[i + 1].latitude,
        sortedLocations[i + 1].longitude,
      )
    }

    return totalDistance.toFixed(2)
  }

  const handleLocationSelect = (location: PetLocation) => {
    setSelectedLocation(location)
  }

  // Agrupar ubicaciones por fecha
  const groupLocationsByDate = () => {
    const grouped: Record<string, PetLocation[]> = {}

    locations.forEach((location) => {
      const date = new Date(location.timestamp).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(location)
    })

    // Ordenar cada grupo por timestamp
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    })

    return grouped
  }

  const groupedLocations = groupLocationsByDate()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Link href="/tracking" className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Historial de ubicaciones</h1>
          <div className="ml-auto">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <div className="space-y-6">
          {/* Map */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-64">
                <StaticMap
                  petLocations={locations}
                  initialZoom={zoom}
                  height="100%"
                  width="100%"
                  onMarkerClick={handleLocationSelect}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-gray-500">Total ubicaciones</div>
                <div className="font-medium text-lg">{locations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-gray-500">Distancia total</div>
                <div className="font-medium text-lg">{calculateTotalDistance()} km</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-gray-500">Período</div>
                <div className="font-medium text-lg">
                  {locations.length > 0 ? `${Object.keys(groupedLocations).length} días` : "0 días"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collapsible Stats Section */}
          <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 h-auto">
                <span className="font-medium">Análisis de actividad</span>
                {isStatsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-2">
              <ActivityChart data={activityData} />
              <MovementStats {...movementStats} />
            </CollapsibleContent>
          </Collapsible>

          {/* Tabs */}
          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="calendar">Calendario</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4 space-y-4">
              {Object.keys(groupedLocations).map((date) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <h3 className="text-sm font-medium">{date}</h3>
                  </div>

                  <div className="space-y-2 pl-6">
                    {groupedLocations[date].map((location) => (
                      <Card
                        key={location.id}
                        className={`${selectedLocation?.id === location.id ? "border-primary" : ""}`}
                        onClick={() => handleLocationSelect(location)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {new Date(location.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-xs mt-1">
                                Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                              </div>
                              {location.speed !== undefined && (
                                <div className="text-xs mt-1 flex items-center">
                                  <span className="text-gray-500 mr-2">
                                    Velocidad: {location.speed.toFixed(1)} km/h
                                  </span>
                                  {location.isMoving ? (
                                    <span className="text-green-500 text-xs">En movimiento</span>
                                  ) : (
                                    <span className="text-gray-500 text-xs">Estático</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2" />
                    <p>Vista de calendario próximamente</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
