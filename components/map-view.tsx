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

declare global {
  interface Window {
    google: any
    initMap: () => void
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
  const [error, setError] = useState<string | null>(null)
  const [map, setMap] = useState<any>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError("Google Maps API key no configurada")
      setIsLoading(false)
      return
    }

    const loadGoogleMaps = () => {
      // Si ya está cargado, inicializar directamente
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      // Crear script para cargar Google Maps
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
      script.async = true
      script.defer = true

      // Función global para callback
      window.initMap = initializeMap

      script.onerror = () => {
        setError("Error al cargar Google Maps API")
        setIsLoading(false)
      }

      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return

      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
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

        // Marcador de ubicación del usuario
        new window.google.maps.Marker({
          position: {
            lat: initialViewState.latitude,
            lng: initialViewState.longitude,
          },
          map: mapInstance,
          title: "Tu ubicación",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        })

        // Marcadores de mascotas
        petLocations.forEach((pet) => {
          const marker = new window.google.maps.Marker({
            position: { lat: pet.latitude, lng: pet.longitude },
            map: mapInstance,
            title: pet.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: pet.status === "lost" ? "#EF4444" : "#10B981",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          })

          const infoWindow = new window.google.maps.InfoWindow({
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
      } catch (err) {
        console.error("Error initializing map:", err)
        setError("Error al inicializar el mapa")
        setIsLoading(false)
      }
    }

    loadGoogleMaps()

    return () => {
      // Cleanup
      if (window.initMap) {
        delete window.initMap
      }
    }
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
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <h3 className="font-medium text-gray-900 mb-1">Error en el mapa</h3>
          <p className="text-sm text-gray-600 mb-3">{error}</p>
          <div className="text-xs text-gray-500">
            <p>Verifica que:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>La API key esté configurada correctamente</li>
              <li>Maps JavaScript API esté habilitada</li>
              <li>La facturación esté activada en Google Cloud</li>
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
