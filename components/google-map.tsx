"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin } from "lucide-react"
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@/env"

interface PetLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  status: "lost" | "found"
  breed?: string
}

interface GoogleMapProps {
  petLocations: PetLocation[]
  height?: string
  onMarkerClick?: (pet: PetLocation) => void
}

export default function GoogleMap({ petLocations, height = "400px", onMarkerClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [map, setMap] = useState<any>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const markersRef = useRef<any[]>([])

  // Función para verificar si Google Maps está disponible
  const isGoogleMapsAvailable = useCallback(() => {
    return typeof window !== "undefined" && window.google && window.google.maps
  }, [])

  // Función para inicializar el mapa
  const initializeMap = useCallback(() => {
    console.log("Attempting to initialize map...")

    // Verificar que el ref existe
    if (!mapRef.current) {
      console.error("Map container ref is null")
      setError("Contenedor del mapa no encontrado")
      setIsLoading(false)
      return
    }

    // Verificar que Google Maps está disponible
    if (!isGoogleMapsAvailable()) {
      console.error("Google Maps not available")
      setError("Google Maps no está disponible")
      setIsLoading(false)
      return
    }

    try {
      console.log("Creating map instance...")

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: -34.6037, lng: -58.3816 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      console.log("Map created successfully")
      setMap(mapInstance)
      setIsLoading(false)
      setError(null)

      // Agregar marcadores después de un pequeño delay
      setTimeout(() => {
        addMarkersToMap(mapInstance)
      }, 100)
    } catch (err) {
      console.error("Error creating map:", err)
      setError("Error al crear el mapa")
      setIsLoading(false)
    }
  }, [isGoogleMapsAvailable])

  // Función para cargar el script de Google Maps
  const loadGoogleMapsScript = useCallback(() => {
    const apiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key not found")
      setError("API key de Google Maps no configurada")
      setIsLoading(false)
      return
    }

    // Verificar si ya está cargado
    if (isGoogleMapsAvailable()) {
      console.log("Google Maps already available")
      setIsScriptLoaded(true)
      initializeMap()
      return
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log("Google Maps script already exists, waiting...")

      const checkInterval = setInterval(() => {
        if (isGoogleMapsAvailable()) {
          console.log("Google Maps loaded")
          clearInterval(checkInterval)
          setIsScriptLoaded(true)
          initializeMap()
        }
      }, 100)

      // Timeout después de 10 segundos
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!isGoogleMapsAvailable()) {
          console.error("Timeout waiting for Google Maps")
          setError("Timeout cargando Google Maps")
          setIsLoading(false)
        }
      }, 10000)

      return
    }

    console.log("Loading Google Maps script...")
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log("Google Maps script loaded")
      setIsScriptLoaded(true)
      // Pequeño delay para asegurar que todo esté inicializado
      setTimeout(() => {
        initializeMap()
      }, 200)
    }

    script.onerror = () => {
      console.error("Error loading Google Maps script")
      setError("Error al cargar Google Maps")
      setIsLoading(false)
    }

    document.head.appendChild(script)
  }, [isGoogleMapsAvailable, initializeMap])

  // Función para agregar marcadores
  const addMarkersToMap = useCallback(
    (mapInstance: any) => {
      if (!mapInstance || !isGoogleMapsAvailable()) {
        console.error("Cannot add markers: map or Google Maps not available")
        return
      }

      console.log("Adding markers to map...")

      // Limpiar marcadores existentes
      markersRef.current.forEach((marker) => {
        if (marker && marker.setMap) {
          marker.setMap(null)
        }
      })
      markersRef.current = []

      try {
        // Marcador de ubicación del usuario
        const userMarker = new window.google.maps.Marker({
          position: { lat: -34.6037, lng: -58.3816 },
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

        markersRef.current.push(userMarker)

        // Marcadores de mascotas
        petLocations.forEach((pet, index) => {
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
                ${pet.breed || ""}
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

          markersRef.current.push(marker)
        })

        console.log(`Added ${markersRef.current.length} markers to map`)
      } catch (err) {
        console.error("Error adding markers:", err)
      }
    },
    [petLocations, onMarkerClick, isGoogleMapsAvailable],
  )

  // Efecto principal para cargar el mapa
  useEffect(() => {
    // Delay inicial para asegurar que el componente esté montado
    const timer = setTimeout(() => {
      loadGoogleMapsScript()
    }, 100)

    return () => {
      clearTimeout(timer)
      // Limpiar marcadores al desmontar
      markersRef.current.forEach((marker) => {
        if (marker && marker.setMap) {
          marker.setMap(null)
        }
      })
      markersRef.current = []
    }
  }, [loadGoogleMapsScript])

  // Efecto para actualizar marcadores cuando cambien las mascotas
  useEffect(() => {
    if (map && isScriptLoaded && !isLoading && !error) {
      addMarkersToMap(map)
    }
  }, [petLocations, map, isScriptLoaded, isLoading, error, addMarkersToMap])

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
          <h3 className="font-medium text-gray-900 mb-1">Mapa no disponible</h3>
          <p className="text-sm text-gray-600 mb-3">{error}</p>
          <div className="text-xs text-gray-500 max-w-xs">
            <p className="mb-2">Para habilitar el mapa:</p>
            <ol className="list-decimal list-inside space-y-1 text-left">
              <li>Obtén una API key de Google Maps</li>
              <li>Habilita Maps JavaScript API</li>
              <li>Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
              <li>Activa la facturación en Google Cloud</li>
            </ol>
          </div>
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
        className="w-full rounded-lg border bg-gray-100"
      />
      {petLocations.length > 0 && (
        <div className="absolute top-2 left-2 bg-white rounded-lg shadow-md p-2 text-xs">
          <div className="flex items-center space-x-4">
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
    </div>
  )
}
