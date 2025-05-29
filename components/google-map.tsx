"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "lucide-react"
import type { PetLocation } from "@/lib/location-service"

declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

type GoogleMapProps = {
  petLocations?: PetLocation[]
  initialCenter?: {
    lat: number
    lng: number
  }
  initialZoom?: number
  height?: string
  width?: string
  onMarkerClick?: (pet: PetLocation) => void
  className?: string
}

export default function GoogleMap({
  petLocations = [],
  initialCenter = {
    lat: 19.4326, // Ciudad de México
    lng: -99.1332,
  },
  initialZoom = 12,
  height = "100%",
  width = "100%",
  onMarkerClick,
  className = "",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar el script de Google Maps
  const loadGoogleMapsScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Verificar si ya está cargado
      if (window.google && window.google.maps) {
        resolve()
        return
      }

      // Verificar si ya existe el script
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Esperar a que se cargue
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            resolve()
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      // Crear función de callback global
      window.initGoogleMaps = () => {
        resolve()
      }

      // Crear y agregar el script
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCOib0-Gj7EPTj1lSbkaWsladqELGH1JPU"
      }&callback=initGoogleMaps&libraries=places`
      script.async = true
      script.defer = true
      script.onerror = () => reject(new Error("Error loading Google Maps"))

      document.head.appendChild(script)
    })
  }

  // Inicializar el mapa
  const initializeMap = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await loadGoogleMapsScript()

      if (!mapRef.current) {
        throw new Error("Map container not found")
      }

      // Crear el mapa
      const map = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          // Estilo personalizado para el mapa (opcional)
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      mapInstanceRef.current = map
      setIsLoading(false)

      // Agregar marcadores
      addMarkers(map)
    } catch (err) {
      console.error("Error initializing Google Maps:", err)
      setError("Error al cargar Google Maps. Verifica tu API key.")
      setIsLoading(false)
    }
  }

  // Función para agregar marcadores
  const addMarkers = (map: any) => {
    // Limpiar marcadores existentes
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    petLocations.forEach((pet) => {
      // Crear marcador personalizado
      const marker = new window.google.maps.Marker({
        position: { lat: pet.latitude, lng: pet.longitude },
        map: map,
        title: pet.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getColorForStatus(pet.status),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      })

      // Crear ventana de información
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px;">${pet.name}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
              ${new Date(pet.timestamp).toLocaleString()}
            </div>
            ${
              pet.imageUrl
                ? `<img src="${pet.imageUrl}" alt="${pet.name}" style="margin-top: 8px; width: 100%; height: 80px; object-fit: cover; border-radius: 4px;" />`
                : ""
            }
            <div style="margin-top: 8px; font-size: 12px; display: flex; align-items: center;">
              <span style="margin-right: 4px;">📍</span>
              <span>${pet.latitude.toFixed(4)}, ${pet.longitude.toFixed(4)}</span>
            </div>
            <div style="margin-top: 4px; font-size: 12px;">
              <span style="padding: 2px 6px; background-color: ${getColorForStatus(
                pet.status,
              )}; color: white; border-radius: 12px; font-size: 10px;">
                ${getStatusText(pet.status)}
              </span>
            </div>
          </div>
        `,
      })

      // Agregar evento de clic
      marker.addListener("click", () => {
        infoWindow.open(map, marker)
        if (onMarkerClick) {
          onMarkerClick(pet)
        }
      })

      markersRef.current.push(marker)
    })

    // Ajustar la vista para mostrar todos los marcadores
    if (petLocations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      petLocations.forEach((pet) => {
        bounds.extend({ lat: pet.latitude, lng: pet.longitude })
      })
      map.fitBounds(bounds)

      // Asegurar un zoom mínimo
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 15) map.setZoom(15)
        window.google.maps.event.removeListener(listener)
      })
    }
  }

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

  // Función para obtener texto del estado
  const getStatusText = (status: string): string => {
    switch (status) {
      case "lost":
        return "Perdido"
      case "found":
        return "Encontrado"
      case "home":
        return "En casa"
      default:
        return "Desconocido"
    }
  }

  // Inicializar mapa al montar el componente
  useEffect(() => {
    initializeMap()
  }, [])

  // Actualizar marcadores cuando cambien las ubicaciones
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addMarkers(mapInstanceRef.current)
    }
  }, [petLocations])

  if (error) {
    return (
      <div
        style={{ height, width }}
        className={`relative rounded-lg overflow-hidden bg-red-50 flex items-center justify-center ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={initializeMap}
            className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height, width }} className={`relative rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600 text-sm">Cargando Google Maps...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  )
}
