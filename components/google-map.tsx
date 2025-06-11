"use client"

import { useEffect, useRef } from "react"

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

  useEffect(() => {
    // Simulación de mapa por ahora
    if (mapRef.current) {
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
                background: #f44336;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transform: translate(-50%, -50%);
              "
              onclick="console.log('Clicked on ${pet.name}')"
            >
              📍 ${pet.name}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    }
  }, [petLocations])

  return (
    <div
      ref={mapRef}
      style={{
        width,
        height,
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    />
  )
}
