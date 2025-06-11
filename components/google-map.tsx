"use client"

import { useEffect, useRef, useState } from "react"

interface PetLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  status?: string
  breed?: string
}

interface GoogleMapProps {
  petLocations: PetLocation[]
  height?: string
  width?: string
  onMarkerClick?: (pet: PetLocation) => void
  initialCenter?: { lat: number; lng: number }
  initialZoom?: number
}

export default function GoogleMap({
  petLocations,
  height = "400px",
  width = "100%",
  onMarkerClick,
  initialCenter = { lat: 19.4326, lng: -99.1332 },
  initialZoom = 12,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulación de mapa por ahora - Versión simplificada que no usa Google Maps API
    if (mapRef.current) {
      try {
        console.log("Rendering simplified map...")

        // Asegurar que el contenedor tenga dimensiones
        mapRef.current.style.width = width
        mapRef.current.style.height = height

        mapRef.current.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            background: linear-gradient(45deg, #e3f2fd 0%, #bbdefb 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
          ">
            <div style="
              background: white;
              padding: 16px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 300px;
              z-index: 10;
            ">
              <div style="font-size: 24px; margin-bottom: 8px;">🗺️</div>
              <h3 style="margin: 0 0 8px 0; color: #1976d2;">Mapa de Mascotas</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">
                ${petLocations.length} mascota${petLocations.length !== 1 ? "s" : ""} encontrada${petLocations.length !== 1 ? "s" : ""}
              </p>
              ${
                petLocations.length > 0
                  ? `
                <div style="margin-top: 12px; font-size: 12px; color: #888;">
                  Ubicaciones: ${petLocations.map((pet) => pet.name).join(", ")}
                </div>
              `
                  : ""
              }
            </div>
            
            ${petLocations
              .map(
                (pet, index) => `
              <div 
                style="
                  position: absolute;
                  top: ${20 + index * 15}%;
                  left: ${30 + index * 20}%;
                  background: ${pet.status === "lost" ? "#f44336" : "#4CAF50"};
                  color: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  transform: translate(-50%, -50%);
                  z-index: 5;
                "
                class="pet-marker"
                data-pet-id="${pet.id}"
              >
                📍 ${pet.name}
              </div>
            `,
              )
              .join("")}
          </div>
        `

        // Agregar event listeners a los marcadores
        const markers = mapRef.current.querySelectorAll(".pet-marker")
        markers.forEach((marker) => {
          marker.addEventListener("click", (e) => {
            const petId = (e.currentTarget as HTMLElement).dataset.petId
            const pet = petLocations.find((p) => p.id === petId)
            if (pet && onMarkerClick) {
              onMarkerClick(pet)
            }
          })
        })

        setIsLoaded(true)
        setError(null)
      } catch (err) {
        console.error("Error rendering simplified map:", err)
        setError("Error al renderizar el mapa")
        setIsLoaded(false)
      }
    }
  }, [petLocations, height, width, onMarkerClick])

  if (error) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-100 rounded-lg border">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🗺️</div>
          <h3 className="font-medium text-gray-900 mb-1">Mapa no disponible</h3>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-100 rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      id="google-map-container"
      style={{
        width,
        height,
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
      className="google-map-container"
    />
  )
}
