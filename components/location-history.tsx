"use client"

import { useState } from "react"
import type { PetLocation } from "./map-view"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, ArrowRight } from "lucide-react"

type LocationHistoryProps = {
  locations: PetLocation[]
  onLocationSelect: (location: PetLocation) => void
}

export default function LocationHistory({ locations, onLocationSelect }: LocationHistoryProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const handleLocationClick = (location: PetLocation) => {
    setSelectedLocation(location.id)
    onLocationSelect(location)
  }

  // Sort locations by timestamp (newest first)
  const sortedLocations = [...locations].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Historial de ubicaciones</h3>
      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {sortedLocations.map((location) => (
          <Card key={location.id} className={`${selectedLocation === location.id ? "border-primary" : ""}`}>
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-3">
                  <MapPin className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{location.name}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(location.timestamp).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => handleLocationClick(location)}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
