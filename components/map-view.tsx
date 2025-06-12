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

interface MapViewProps {
  petLocations: PetLocation[]
  height?: string
  width?: string
  onMarkerClick?: (pet: PetLocation) => void
  initialViewState?: {
    latitude: number
    longitude: number
    zoom: number
  }
}

// Store fixed positions for pets globally - this will persist across re-renders
const globalPetPositions = new Map<string, { top: number; left: number }>()

export default function MapView({
  petLocations,
  height = "400px",
  width = "100%",
  onMarkerClick,
  initialViewState = { latitude: -34.626766, longitude: -58.398107, zoom: 14 },
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [petMarkersHtml, setPetMarkersHtml] = useState("")

  // Generate fixed positions for pets only once
  useEffect(() => {
    let markersChanged = false

    petLocations.forEach((pet) => {
      if (!globalPetPositions.has(pet.id)) {
        // Generate a fixed random position for this pet only if it doesn't exist
        const top = 25 + Math.random() * 50 // Random position between 25% and 75%
        const left = 25 + Math.random() * 50 // Random position between 25% and 75%
        globalPetPositions.set(pet.id, { top, left })
        markersChanged = true
      }
    })

    // Only regenerate HTML if positions changed
    if (markersChanged || petMarkersHtml === "") {
      const markers = petLocations
        .map((pet) => {
          const position = globalPetPositions.get(pet.id)!

          return `
          <div 
            style="
              position: absolute;
              top: ${position.top}%;
              left: ${position.left}%;
              background: ${pet.status === "lost" ? "#f44336" : "#4CAF50"};
              color: white;
              padding: 6px 10px;
              border-radius: 15px;
              font-size: 11px;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              transform: translate(-50%, -50%);
              z-index: 5;
              border: 2px solid white;
              font-weight: 500;
              min-width: 60px;
              text-align: center;
              transition: all 0.2s ease;
            "
            class="pet-marker"
            data-pet-id="${pet.id}"
            onmouseover="this.style.transform='translate(-50%, -50%) scale(1.1)'"
            onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'"
          >
            📍 ${pet.name}
          </div>
        `
        })
        .join("")

      setPetMarkersHtml(markers)
    }
  }, [petLocations])

  useEffect(() => {
    if (mapRef.current) {
      // Set the iframe with the new Google Maps embed
      mapRef.current.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%;">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.742895263809!2d-58.39754855046805!3d-34.62611273036749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb18b13e51bd%3A0x8774a1856072a6c1!2sPasco%20%26%20Avenida%20Pav%C3%B3n%2C%20C1256%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1749696887948!5m2!1ses-419!2sar" 
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          
          <!-- Pet markers overlay with fixed positions -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
            ${petMarkersHtml}
          </div>
          
          <!-- Legend -->
          <div style="
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            font-size: 12px;
            z-index: 10;
          ">
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <div style="width: 12px; height: 12px; background: #f44336; border-radius: 50%; margin-right: 6px;"></div>
              <span>Perdidos (${petLocations.filter((p) => p.status === "lost").length})</span>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="width: 12px; height: 12px; background: #4CAF50; border-radius: 50%; margin-right: 6px;"></div>
              <span>Encontrados (${petLocations.filter((p) => p.status === "found").length})</span>
            </div>
          </div>
        </div>
      `

      // Add event listeners to the markers
      setTimeout(() => {
        const markers = mapRef.current?.querySelectorAll(".pet-marker") || []
        markers.forEach((marker) => {
          marker.style.pointerEvents = "auto"
          marker.addEventListener("click", (e) => {
            const petId = (e.currentTarget as HTMLElement).dataset.petId
            const pet = petLocations.find((p) => p.id === petId)
            if (pet && onMarkerClick) {
              onMarkerClick(pet)
            }
          })
        })
      }, 500)

      setIsLoaded(true)
    }
  }, [petMarkersHtml, height, width, onMarkerClick])

  return (
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
  )
}
