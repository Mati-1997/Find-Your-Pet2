"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

interface PetLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  status?: string
  breed?: string
  description?: string
}

interface GoogleMapsLocalProps {
  petLocations: PetLocation[]
  height?: string
  width?: string
  onMarkerClick?: (pet: PetLocation) => void
  initialCenter?: { lat: number; lng: number }
  initialZoom?: number
}

// Store fixed positions for pets to prevent them from moving
const petFixedPositions = new Map<string, { lat: number; lng: number }>()

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function GoogleMapsLocal({
  petLocations,
  height = "400px",
  width = "100%",
  onMarkerClick,
  initialCenter = { lat: -34.626766, lng: -58.398107 },
  initialZoom = 14,
}: GoogleMapsLocalProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Generate fixed positions for pets
  const getFixedPetPosition = (petId: string) => {
    if (!petFixedPositions.has(petId)) {
      // Generate a fixed random position around Buenos Aires
      const lat = initialCenter.lat + (Math.random() - 0.5) * 0.02 // ~1km radius
      const lng = initialCenter.lng + (Math.random() - 0.5) * 0.02
      petFixedPositions.set(petId, { lat, lng })
    }
    return petFixedPositions.get(petId)!
  }

  // Initialize map when Google Maps API is loaded
  const initializeMap = () => {
    if (!window.google || !mapRef.current) return

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    })

    setMap(mapInstance)
    setIsLoaded(true)
  }

  // Create markers for pets
  useEffect(() => {
    if (!map || !window.google) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    const newMarkers = petLocations.map((pet) => {
      const position = getFixedPetPosition(pet.id)

      // Create custom marker icon
      const icon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: pet.status === "lost" ? "#f44336" : "#4CAF50",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      }

      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: pet.name,
        icon: icon,
      })

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">${pet.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;"><strong>Raza:</strong> ${pet.breed || "Desconocida"}</p>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;"><strong>Estado:</strong> 
              <span style="color: ${pet.status === "lost" ? "#f44336" : "#4CAF50"};">
                ${pet.status === "lost" ? "Perdido" : "Encontrado"}
              </span>
            </p>
            ${pet.description ? `<p style="margin: 0; color: #666; font-size: 12px;">${pet.description}</p>` : ""}
            <button 
              onclick="window.handlePetClick('${pet.id}')"
              style="
                margin-top: 8px;
                padding: 6px 12px;
                background: #2196F3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              "
            >
              Ver detalles
            </button>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })

      return marker
    })

    setMarkers(newMarkers)

    // Set up global click handler
    window.handlePetClick = (petId: string) => {
      const pet = petLocations.find((p) => p.id === petId)
      if (pet && onMarkerClick) {
        onMarkerClick(pet)
      }
    }
  }, [map, petLocations, onMarkerClick])

  return (
    <>
      <Script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD79Oyprpt1hevFiPcpNJjc22qHViGTo7I&callback=initMap"
        onLoad={() => {
          window.initMap = initializeMap
          if (window.google) {
            initializeMap()
          }
        }}
      />
      <div
        ref={mapRef}
        style={{
          width,
          height,
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />
      {!isLoaded && (
        <div
          style={{
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                animation: "spin 2s linear infinite",
                margin: "0 auto 10px",
              }}
            />
            <p style={{ color: "#666", margin: 0 }}>Cargando mapa...</p>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
