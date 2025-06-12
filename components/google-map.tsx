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
  initialCenter = { lat: -34.626766, lng: -58.398107 },
  initialZoom = 14,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (mapRef.current) {
      // Generate random points for pets around the center location
      const petMarkers = petLocations
        .map((pet, index) => {
          // Generate random offsets for latitude and longitude (within ~1km)
          const latOffset = (Math.random() - 0.5) * 0.01
          const lngOffset = (Math.random() - 0.5) * 0.01

          // Calculate marker position
          const markerTop = 20 + Math.random() * 60 // Random position between 20% and 80%
          const markerLeft = 20 + Math.random() * 60 // Random position between 20% and 80%

          return `
          <div 
            style="
              position: absolute;
              top: ${markerTop}%;
              left: ${markerLeft}%;
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
        `
        })
        .join("")

      // Set the iframe with the Google Maps embed
      mapRef.current.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%;">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.0200303601187!2d-58.39810672373697!3d-34.62676635871669!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb18b13e51bd%3A0x8774a1856072a6c1!2sPasco%20%26%20Avenida%20Pav%C3%B3n%2C%20C1256%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e1!3m2!1ses-419!2sar!4v1749696134164!5m2!1ses-419!2sar" 
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          
          <!-- Pet markers overlay -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
            ${petMarkers}
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
  }, [petLocations, height, width, onMarkerClick, initialCenter, initialZoom])

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
