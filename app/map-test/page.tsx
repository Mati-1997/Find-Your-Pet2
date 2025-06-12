"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import MapViewEnhanced from "@/components/map-view-enhanced"

interface PetLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  status: "lost" | "found"
  breed: string
  description?: string
}

export default function MapTestPage() {
  const router = useRouter()
  const [useLocalMaps, setUseLocalMaps] = useState(true)
  const [pets, setPets] = useState<PetLocation[]>([])

  useEffect(() => {
    // Generate sample pets for testing
    const samplePets: PetLocation[] = [
      {
        id: "test-1",
        name: "Max",
        breed: "Golden Retriever",
        latitude: -34.626766,
        longitude: -58.398107,
        status: "lost",
        description: "Perro dorado, muy amigable, collar azul",
      },
      {
        id: "test-2",
        name: "Luna",
        breed: "Gato Mestizo",
        latitude: -34.625,
        longitude: -58.395,
        status: "found",
        description: "Gata blanca con manchas negras",
      },
      {
        id: "test-3",
        name: "Rocky",
        breed: "Pastor Alemán",
        latitude: -34.628,
        longitude: -58.401,
        status: "lost",
        description: "Perro grande, collar rojo",
      },
      {
        id: "test-4",
        name: "Mimi",
        breed: "Siamés",
        latitude: -34.624,
        longitude: -58.399,
        status: "found",
        description: "Gato siamés, muy cariñoso",
      },
      {
        id: "test-5",
        name: "Toby",
        breed: "Labrador",
        latitude: -34.629,
        longitude: -58.396,
        status: "lost",
        description: "Labrador negro, muy juguetón",
      },
    ]
    setPets(samplePets)
  }, [])

  const handlePetClick = (pet: PetLocation) => {
    alert(`Clicked on ${pet.name} (${pet.status})\n${pet.description}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" className="mr-4 p-0" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Test de Mapas - Google Maps API</h1>
        </div>
      </header>

      {/* Controls */}
      <div className="container px-4 py-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <MapPin className="w-5 h-5 text-blue-600" />
          <div className="flex items-center space-x-2">
            <Switch id="map-type" checked={useLocalMaps} onCheckedChange={setUseLocalMaps} />
            <Label htmlFor="map-type">Usar Google Maps API local</Label>
          </div>
          <Badge variant={useLocalMaps ? "default" : "secondary"}>{useLocalMaps ? "API Local" : "Iframe"}</Badge>
        </div>
      </div>

      {/* Instructions */}
      <div className="container px-4 py-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="w-5 h-5" />
              <span>Instrucciones de Configuración</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-2">Para usar Google Maps API:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Ve a Google Cloud Console</li>
                  <li>Crea un proyecto o selecciona uno existente</li>
                  <li>Habilita la API de Google Maps JavaScript</li>
                  <li>Crea una API Key</li>
                  <li>Reemplaza "YOUR_API_KEY_HERE" en el componente GoogleMapsLocal con tu API key real</li>
                </ol>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 mb-1">Funcionalidades del mapa con API:</p>
                <ul className="list-disc list-inside space-y-1 text-green-700">
                  <li>Marcadores reales en coordenadas específicas</li>
                  <li>Info windows con detalles de las mascotas</li>
                  <li>Interacción completa con el mapa</li>
                  <li>Posiciones fijas que no se mueven</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-red-600">{pets.filter((p) => p.status === "lost").length}</div>
              <p className="text-xs text-gray-600">Perdidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-600">{pets.filter((p) => p.status === "found").length}</div>
              <p className="text-xs text-gray-600">Encontrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{pets.length}</div>
              <p className="text-xs text-gray-600">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card>
          <CardContent className="p-0">
            <MapViewEnhanced
              petLocations={pets}
              height="500px"
              onMarkerClick={handlePetClick}
              initialViewState={{
                latitude: -34.626766,
                longitude: -58.398107,
                zoom: 15,
              }}
              useLocalMaps={useLocalMaps}
            />
          </CardContent>
        </Card>

        {/* Pet List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Mascotas de Prueba ({pets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handlePetClick(pet)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm">🐕</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{pet.name}</h4>
                      <p className="text-xs text-gray-500">{pet.breed}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={pet.status === "lost" ? "destructive" : "default"} className="text-xs">
                      {pet.status === "lost" ? "Perdido" : "Encontrado"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {pet.latitude.toFixed(4)}, {pet.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
