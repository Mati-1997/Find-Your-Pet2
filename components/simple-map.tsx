"use client"

import { MapPin } from "lucide-react"
import type { PetLocation } from "./map-view"

type SimpleMapProps = {
  petLocations?: PetLocation[]
  height?: string
  width?: string
  className?: string
}

export default function SimpleMap({
  petLocations = [],
  height = "100%",
  width = "100%",
  className = "",
}: SimpleMapProps) {
  return (
    <div
      style={{ height, width }}
      className={`relative rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}
    >
      <div className="text-center">
        <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-500" />
        <p className="text-gray-600">Mapa de ubicaciones</p>
        {petLocations.length > 0 && (
          <p className="text-gray-500 text-sm mt-2">
            {petLocations.length} ubicación{petLocations.length !== 1 ? "es" : ""} disponible
            {petLocations.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  )
}
