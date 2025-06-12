"use client"

import { useEffect, useRef } from "react"

interface SimpleMapProps {
  latitude: number
  longitude: number
  height?: string
  width?: string
  zoom?: number
  className?: string
}

export default function SimpleMap({
  latitude = -34.626766,
  longitude = -58.398107,
  height = "300px",
  width = "100%",
  zoom = 15,
  className = "",
}: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mapRef.current) {
      // Set the iframe with the Google Maps embed
      mapRef.current.innerHTML = `
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.0200303601187!2d-58.39810672373697!3d-34.62676635871669!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb18b13e51bd%3A0x8774a1856072a6c1!2sPasco%20%26%20Avenida%20Pav%C3%B3n%2C%20C1256%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e1!3m2!1ses-419!2sar!4v1749696134164!5m2!1ses-419!2sar" 
          width="100%" 
          height="100%" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
        
        <!-- Location marker -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          pointer-events: none;
        ">
          <div style="
            background-color: #ff4757;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        </div>
      `
    }
  }, [latitude, longitude, zoom])

  return (
    <div
      ref={mapRef}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        borderRadius: "8px",
      }}
      className={className}
    />
  )
}
