"use client"

import { useEffect, useRef, useState } from "react"
import * as google from "google.maps"

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
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

      if (!apiKey) {
        setError("API key de Google Maps no configurada")
        setIsLoading(false)
        return
      }

      try {
        // Cargar Google Maps API dinámicamente
        if (!window.google) {
          const script = document.createElement("script")
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
          script.async = true
          script.defer = true

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Error loading Google Maps"))
            document.head.appendChild(script)
          })
        }

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: {
              lat: initialViewState.latitude,
              lng: initialViewState.longitude,
            },
            zoom: initialViewState.zoom,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          })

          setMap(mapInstance)

          // Agregar marcador de ubicación del usuario
          new google.maps.Marker({
            position: {
              lat: initialViewState.latitude,
              lng: initialViewState.longitude,
            },
            map: mapInstance,
            title: "Tu ubicación",
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
            },
          })

          // Agregar marcadores de mascotas
          petLocations.forEach((pet) => {
            const marker = new google.maps.Marker({
              position: { lat: pet.latitude, lng: pet.longitude },
              map: mapInstance,
              title: pet.name,
              icon: {
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="${pet.status === "lost" ? "#EF4444" : "#10B981"}" stroke="#FFFFFF" strokeWidth="2"/>
                    <text x="16" y="20" textAnchor="middle" fill="white" fontSize="16">🐕</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
              },
            })

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${pet.name}</h3>
                  <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">
                    Estado: <span style="color: ${pet.status === "lost" ? "#EF4444" : "#10B981"}; font-weight: bold;">
                      ${pet.status === "lost" ? "Perdido" : "Encontrado"}
                    </span>
                  </p>
                  <p style="margin: 0; color: #888; font-size: 12px;">
                    ${new Date(pet.timestamp).toLocaleDateString("es-AR")}
                  </p>
                </div>
              `,
            })

            marker.addListener("click", () => {
              infoWindow.open(mapInstance, marker)
              if (onMarkerClick) {
                onMarkerClick(pet)
              }
            })
          })

          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error loading Google Maps:", err)
        setError("Error al cargar Google Maps")
        setIsLoading(false)
      }
    }

    initMap()
  }, [petLocations, initialViewState, onMarkerClick])

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

  if (error) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 rounded-lg border">
        <div className="text-center p-4">
          <div className="text-red-500 text-4xl mb-2">🗺️</div>
          <h3 className="font-medium text-gray-900 mb-1">Error en el mapa</h3>
          <p className="text-sm text-gray-600 mb-3">{error}</p>
          <div className="text-xs text-gray-500">
            <p>Verifica que:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>La API key esté configurada</li>
              <li>Maps JavaScript API esté habilitada</li>
              <li>La facturación esté activada</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height }} className="w-full rounded-lg border" />
      {petLocations.length > 0 && (
        <div className="absolute top-2 left-2 bg-white rounded-lg shadow-md p-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>Perdidos</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Encontrados</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
