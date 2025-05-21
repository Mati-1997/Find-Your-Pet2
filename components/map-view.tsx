"use client"

import { useEffect, useRef, useState } from "react"
import "mapbox-gl/dist/mapbox-gl.css"

export type PetLocation = {
  id: string
  name: string
  latitude: number
  longitude: number
  timestamp: string
  imageUrl?: string
  status: "lost" | "found" | "home"
}

type MapViewProps = {
  petLocations?: PetLocation[]
  initialViewState?: {
    longitude: number
    latitude: number
    zoom: number
  }
  showNavigation?: boolean
  showGeolocate?: boolean
  height?: string
  width?: string
  onMarkerClick?: (pet: PetLocation) => void
  className?: string
}

export default function MapView({
  petLocations = [],
  initialViewState = {
    longitude: -99.1332,
    latitude: 19.4326,
    zoom: 12,
  },
  showNavigation = true,
  showGeolocate = true,
  height = "100%",
  width = "100%",
  onMarkerClick,
  className = "",
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const markersRef = useRef<any[]>([])

  // Inicializar el mapa
  useEffect(() => {
    if (map.current) return // Si el mapa ya está inicializado, no hacer nada

    const initializeMap = async () => {
      try {
        // Importar mapbox-gl dinámicamente
        const mapboxgl = (await import("mapbox-gl")).default

        // Verificar que el token existe
        if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
          console.error("Mapbox token is missing. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable.")
          return
        }

        // Asignar el token
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

        // Verificar que el contenedor existe
        if (!mapContainer.current) {
          console.error("Map container not found")
          return
        }

        // Crear el mapa con manejo de errores
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [initialViewState.longitude, initialViewState.latitude],
          zoom: initialViewState.zoom,
        })

        // Manejar eventos del mapa
        mapInstance.on("load", () => {
          console.log("Map loaded successfully")
          setMapLoaded(true)
        })

        mapInstance.on("error", (e) => {
          console.error("Mapbox error:", e)
        })

        // Añadir controles si se solicitan
        if (showNavigation) {
          mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right")
        }

        if (showGeolocate) {
          mapInstance.addControl(
            new mapboxgl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true,
              },
              trackUserLocation: true,
            }),
            "top-right",
          )
        }

        // Guardar referencia al mapa
        map.current = mapInstance
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()

    // Limpiar al desmontar
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [initialViewState.latitude, initialViewState.longitude, initialViewState.zoom, showGeolocate, showNavigation])

  // Actualizar marcadores cuando cambian las ubicaciones o cuando el mapa se carga
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const addMarkers = async () => {
      try {
        // Importar mapbox-gl dinámicamente
        const mapboxgl = (await import("mapbox-gl")).default

        // Limpiar marcadores existentes
        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []

        // Añadir nuevos marcadores
        petLocations.forEach((pet) => {
          // Crear elemento para el marcador
          const el = document.createElement("div")
          el.className = `marker-${pet.status}`
          el.style.width = "24px"
          el.style.height = "24px"
          el.style.borderRadius = "50%"
          el.style.backgroundColor = getColorForStatus(pet.status)
          el.style.display = "flex"
          el.style.alignItems = "center"
          el.style.justifyContent = "center"
          el.innerHTML = `<span style="color: white; font-weight: bold;">🐾</span>`

          // Crear y añadir el marcador
          const marker = new mapboxgl.Marker(el)
            .setLngLat([pet.longitude, pet.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div style="padding: 8px; max-width: 200px;">
                  <div style="font-weight: 500; font-size: 14px;">${pet.name}</div>
                  <div style="font-size: 12px; color: #666;">${new Date(pet.timestamp).toLocaleString()}</div>
                  ${
                    pet.imageUrl
                      ? `<img src="${pet.imageUrl}" alt="${pet.name}" style="margin-top: 8px; width: 100%; height: 80px; object-fit: cover; border-radius: 4px;" />`
                      : ""
                  }
                  <div style="margin-top: 8px; font-size: 12px; display: flex; align-items: center;">
                    <span style="margin-right: 4px;">📍</span>
                    <span>${pet.latitude.toFixed(4)}, ${pet.longitude.toFixed(4)}</span>
                  </div>
                </div>
              `),
            )
            .addTo(map.current)

          // Añadir evento de clic
          el.addEventListener("click", () => {
            if (onMarkerClick) {
              onMarkerClick(pet)
            }
          })

          // Guardar referencia al marcador
          markersRef.current.push(marker)
        })
      } catch (error) {
        console.error("Error adding markers:", error)
      }
    }

    addMarkers()
  }, [petLocations, mapLoaded, onMarkerClick])

  // Actualizar la vista del mapa cuando cambia initialViewState
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setCenter([initialViewState.longitude, initialViewState.latitude])
      map.current.setZoom(initialViewState.zoom)
    }
  }, [initialViewState, mapLoaded])

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

  return (
    <div
      ref={mapContainer}
      style={{ height, width }}
      className={`relative rounded-lg overflow-hidden ${className}`}
      data-testid="map-container"
    />
  )
}
