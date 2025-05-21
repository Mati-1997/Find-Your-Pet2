"use client"

import { useState } from "react"
import { MapPin, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PetLocation } from "@/lib/location-service"

type StaticMapProps = {
  petLocations?: PetLocation[]
  initialZoom?: number
  height?: string
  width?: string
  onMarkerClick?: (pet: PetLocation) => void
  className?: string
}

export default function StaticMap({
  petLocations = [],
  initialZoom = 12,
  height = "100%",
  width = "100%",
  onMarkerClick,
  className = "",
}: StaticMapProps) {
  const [zoom, setZoom] = useState(initialZoom)
  const [selectedPet, setSelectedPet] = useState<PetLocation | null>(null)

  // Función para obtener color según el estado
  const getColorForStatus = (status: string): string => {
    switch (status) {
      case "lost":
        return "#ef4444" // Rojo
      case "found":
        return "#22c55e" // Verde
      case "home":
        return "#3b82f6" // Azul
      default:
        return "#6b7280" // Gris
    }
  }

  const handleMarkerClick = (pet: PetLocation) => {
    setSelectedPet(pet === selectedPet ? null : pet)
    if (onMarkerClick) {
      onMarkerClick(pet)
    }
  }

  // Calcular el tamaño de los marcadores basado en el zoom
  const markerSize = Math.max(10, zoom * 1.5)

  return (
    <div style={{ height, width }} className={`relative rounded-lg overflow-hidden bg-gray-200 ${className}`}>
      {/* Fondo del mapa */}
      <div className="absolute inset-0 bg-gray-200">
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className={`border border-gray-300 ${i % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}`}></div>
          ))}
        </div>
      </div>

      {/* Marcadores */}
      <div className="absolute inset-0">
        {petLocations.map((pet) => {
          // Calcular posición relativa (simplificada para demostración)
          const x = ((pet.longitude + 180) / 360) * 100
          const y = ((90 - pet.latitude) / 180) * 100

          return (
            <div
              key={pet.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              onClick={() => handleMarkerClick(pet)}
            >
              <div
                className="rounded-full flex items-center justify-center animate-pulse"
                style={{
                  width: `${markerSize}px`,
                  height: `${markerSize}px`,
                  backgroundColor: getColorForStatus(pet.status),
                }}
              >
                <span className="text-white text-xs">🐾</span>
              </div>
              {selectedPet?.id === pet.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white p-2 rounded shadow-lg z-10 w-48">
                  <div className="text-sm font-medium">{pet.name}</div>
                  <div className="text-xs text-gray-500">{new Date(pet.timestamp).toLocaleString()}</div>
                  <div className="text-xs mt-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>
                      {pet.latitude.toFixed(4)}, {pet.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Controles */}
      <div className="absolute top-2 right-2 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => setZoom((prev) => Math.min(prev + 1, 20))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => setZoom((prev) => Math.max(prev - 1, 1))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 p-2 rounded shadow-sm text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span>Perdido</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>Encontrado</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span>En casa</span>
        </div>
      </div>
    </div>
  )
}
