"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

interface PetLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  timestamp: string
  status: "lost" | "found"
  imageUrl?: string
}

interface MapViewProps {
  petLocations: PetLocation[]
  height?: string
  onMarkerClick?: (pet: PetLocation) => void
  initialViewState?: {
    latitude: number
    longitude: number
    zoom: number
  }
}

export default function MapView({
  petLocations,
  height = "400px",
  onMarkerClick,
  initialViewState = { latitude: -34.6037, longitude: -58.3816, zoom: 13 },
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga del mapa
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleMarkerClick = (pet: PetLocation) => {
    if (onMarkerClick) {
      onMarkerClick(pet)
    }
  }

  if (isLoading) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{
          height,
          width: "100%",
          minHeight: "300px",
        }}
        className="w-full rounded-lg border bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden"
      >
        {/* Fondo del mapa simulado */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-blue-200">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Centro del mapa */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-blue-500 rounded-full p-2 shadow-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div className="text-xs text-center mt-1 bg-white px-2 py-1 rounded shadow text-gray-700">Tu ubicación</div>
        </div>

        {/* Marcadores de mascotas */}
        {petLocations.map((pet, index) => {
          const angle = index * 60 * (Math.PI / 180) // Distribuir en círculo
          const radius = 80 + index * 20 // Radio variable
          const x = 50 + (radius * Math.cos(angle)) / 3 // Posición X en porcentaje
          const y = 50 + (radius * Math.sin(angle)) / 3 // Posición Y en porcentaje

          return (
            <div
              key={pet.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${Math.max(10, Math.min(90, x))}%`,
                top: `${Math.max(10, Math.min(90, y))}%`,
              }}
              onClick={() => handleMarkerClick(pet)}
            >
              <div
                className={`rounded-full p-2 shadow-lg transition-transform group-hover:scale-110 ${
                  pet.status === "lost" ? "bg-red-500" : "bg-green-500"
                }`}
              >
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="font-medium">{pet.name}</div>
                <div className={`text-xs ${pet.status === "lost" ? "text-red-600" : "text-green-600"}`}>
                  {pet.status === "lost" ? "Perdido" : "Encontrado"}
                </div>
              </div>
            </div>
          )
        })}

        {/* Información del mapa */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
          <h3 className="font-semibold text-gray-800 mb-1">Mapa de Mascotas</h3>
          <p className="text-sm text-gray-600">
            {petLocations.length} mascota{petLocations.length !== 1 ? "s" : ""} en el área
          </p>
          {petLocations.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">Haz clic en los marcadores para más información</div>
          )}
        </div>

        {/* Leyenda */}
        {petLocations.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-2">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span>Perdidos ({petLocations.filter((p) => p.status === "lost").length})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Encontrados ({petLocations.filter((p) => p.status === "found").length})</span>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay mascotas */}
        {petLocations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white rounded-lg shadow-md p-6 max-w-sm">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">No hay mascotas en el mapa</h3>
              <p className="text-sm text-gray-500">Registra mascotas para ver sus ubicaciones aquí</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
