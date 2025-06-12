"use client"

import { useState } from "react"
import GoogleMapsLocal from "./google-maps-local"

interface PetLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  status?: string
  breed?: string
  description?: string
}

interface MapViewEnhancedProps {
  petLocations: PetLocation[]
  height?: string
  width?: string
  onMarkerClick?: (pet: PetLocation) => void
  initialViewState?: {
    latitude: number
    longitude: number
    zoom: number
  }
  useLocalMaps?: boolean
}

export default function MapViewEnhanced({
  petLocations,
  height = "400px",
  width = "100%",
  onMarkerClick,
  initialViewState = { latitude: -34.626766, longitude: -58.398107, zoom: 14 },
  useLocalMaps = false,
}: MapViewEnhancedProps) {
  const [mapType, setMapType] = useState<"iframe" | "local">(useLocalMaps ? "local" : "iframe")

  if (mapType === "local") {
    return (
      <div>
        <div style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#f0f8ff", borderRadius: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "14px", color: "#333" }}>🗺️ Mapa interactivo con Google Maps API</span>
            <button
              onClick={() => setMapType("iframe")}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cambiar a iframe
            </button>
          </div>
        </div>
        <GoogleMapsLocal
          petLocations={petLocations}
          height={height}
          width={width}
          onMarkerClick={onMarkerClick}
          initialCenter={{
            lat: initialViewState.latitude,
            lng: initialViewState.longitude,
          }}
          initialZoom={initialViewState.zoom}
        />
      </div>
    )
  }

  // Fallback to iframe version
  return (
    <div>
      <div style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#fff3cd", borderRadius: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "14px", color: "#333" }}>📍 Mapa con iframe (limitado)</span>
          <button
            onClick={() => setMapType("local")}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Usar Google Maps API
          </button>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width,
          height,
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.742895263809!2d-58.39754855046805!3d-34.62611273036749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb18b13e51bd%3A0x8774a1856072a6c1!2sPasco%20%26%20Avenida%20Pav%C3%B3n%2C%20C1256%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1749696887948!5m2!1ses-419!2sar"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {/* Overlay markers for iframe version */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {petLocations.map((pet, index) => (
            <div
              key={pet.id}
              style={{
                position: "absolute",
                top: `${25 + ((index * 15) % 50)}%`,
                left: `${25 + ((index * 20) % 50)}%`,
                background: pet.status === "lost" ? "#f44336" : "#4CAF50",
                color: "white",
                padding: "6px 10px",
                borderRadius: "15px",
                fontSize: "11px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                transform: "translate(-50%, -50%)",
                zIndex: 5,
                border: "2px solid white",
                fontWeight: 500,
                minWidth: "60px",
                textAlign: "center",
                pointerEvents: "auto",
              }}
              onClick={() => onMarkerClick && onMarkerClick(pet)}
            >
              📍 {pet.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
