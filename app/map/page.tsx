"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter, Layers, Navigation, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuthCheck } from "@/hooks/use-auth-check"
import MapView from "@/components/map-view"

interface PetLocation {
  id: string
  name: string
  breed: string
  latitude: number
  longitude: number
  timestamp: string
  status: "lost" | "found"
  description?: string
  imageUrl?: string
}

export default function MapPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuthCheck()
  const [pets, setPets] = useState<PetLocation[]>([])
  const [filteredPets, setFilteredPets] = useState<PetLocation[]>([])
  const [userLocation, setUserLocation] = useState({ lat: -34.6037, lng: -58.3816 })
  const [filters, setFilters] = useState({
    status: "all",
    radius: "10",
    species: "all",
  })
  const [mapType, setMapType] = useState("roadmap")

  useEffect(() => {
    if (!loading && user) {
      loadPetsData()
      getUserLocation()
    }
  }, [loading, user])

  useEffect(() => {
    applyFilters()
  }, [pets, filters])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          toast({
            title: "Ubicación actualizada",
            description: "Se ha obtenido tu ubicación actual",
          })
        },
        (error) => {
          console.log("Error getting location:", error)
          toast({
            title: "Ubicación no disponible",
            description: "Usando ubicación por defecto (Buenos Aires)",
          })
        },
      )
    }
  }

  const loadPetsData = async () => {
    try {
      const supabase = createClient()
      const { data: petsData, error } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading pets:", error)
        // Usar datos de ejemplo
        const examplePets: PetLocation[] = [
          {
            id: "example-1",
            name: "Max",
            breed: "Golden Retriever",
            latitude: userLocation.lat + 0.005,
            longitude: userLocation.lng + 0.005,
            timestamp: new Date().toISOString(),
            status: "lost",
            description: "Perro dorado, muy amigable, collar azul",
          },
          {
            id: "example-2",
            name: "Luna",
            breed: "Gato Mestizo",
            latitude: userLocation.lat - 0.003,
            longitude: userLocation.lng + 0.002,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: "found",
            description: "Gata blanca con manchas negras",
          },
          {
            id: "example-3",
            name: "Rocky",
            breed: "Pastor Alemán",
            latitude: userLocation.lat + 0.002,
            longitude: userLocation.lng - 0.004,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: "lost",
            description: "Perro grande, collar rojo",
          },
        ]
        setPets(examplePets)
        return
      }

      if (petsData && petsData.length > 0) {
        const formattedPets: PetLocation[] = petsData.map((pet) => ({
          id: pet.id,
          name: pet.name,
          breed: pet.breed || "Raza desconocida",
          latitude: pet.last_known_latitude || userLocation.lat + (Math.random() - 0.5) * 0.01,
          longitude: pet.last_known_longitude || userLocation.lng + (Math.random() - 0.5) * 0.01,
          timestamp: pet.created_at,
          status: pet.is_lost ? "lost" : "found",
          description: pet.description,
          imageUrl: pet.image_url,
        }))
        setPets(formattedPets)
      }
    } catch (error) {
      console.error("Error loading pets:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar las mascotas",
        variant: "destructive",
      })
    }
  }

  const applyFilters = () => {
    let filtered = [...pets]

    // Filtrar por estado
    if (filters.status !== "all") {
      filtered = filtered.filter((pet) => pet.status === filters.status)
    }

    // Filtrar por radio (simulado)
    const radiusKm = Number.parseInt(filters.radius)
    if (radiusKm < 50) {
      // En una implementación real, calcularías la distancia real
      filtered = filtered.filter(() => Math.random() > 0.2) // Simular filtro de distancia
    }

    setFilteredPets(filtered)
  }

  const handlePetClick = (pet: PetLocation) => {
    router.push(`/pet-detail?id=${pet.id}`)
  }

  const refreshData = () => {
    toast({
      title: "Actualizando datos",
      description: "Obteniendo las últimas ubicaciones...",
    })
    loadPetsData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
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
          <h1 className="text-lg font-semibold">Mapa de Mascotas</h1>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={getUserLocation}>
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container px-4 py-4 bg-white border-b">
        <div className="flex items-center space-x-4 overflow-x-auto">
          <div className="flex items-center space-x-2 min-w-0">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="lost">Perdidos</SelectItem>
              <SelectItem value="found">Encontrados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.radius} onValueChange={(value) => setFilters({ ...filters, radius: value })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 km</SelectItem>
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <Select value={mapType} onValueChange={setMapType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roadmap">Mapa</SelectItem>
                <SelectItem value="satellite">Satélite</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-red-600">
                {filteredPets.filter((p) => p.status === "lost").length}
              </div>
              <p className="text-xs text-gray-600">Perdidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {filteredPets.filter((p) => p.status === "found").length}
              </div>
              <p className="text-xs text-gray-600">Encontrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{filteredPets.length}</div>
              <p className="text-xs text-gray-600">Total</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map */}
      <main className="container px-4 pb-6">
        <Card>
          <CardContent className="p-0">
            <MapView
              petLocations={filteredPets}
              height="500px"
              onMarkerClick={handlePetClick}
              initialViewState={{
                latitude: userLocation.lat,
                longitude: userLocation.lng,
                zoom: 13,
              }}
            />
          </CardContent>
        </Card>

        {/* Pet List */}
        {filteredPets.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Mascotas en el mapa ({filteredPets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredPets.map((pet) => (
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
                        {new Date(pet.timestamp).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
