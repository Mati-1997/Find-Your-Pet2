"use client"

import { useEffect, useRef } from "react"

interface StaticMapProps {
  latitude: number
  longitude: number
  height?: string
  width?: string
  zoom?: number
  className?: string
}

export default function StaticMap({
  latitude = -34.626766,
  longitude = -58.398107,
  height = "200px",
  width = "100%",
  zoom = 14,
  className = "",
}: StaticMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.742895263809!2d-58.39754855046805!3d-34.62611273036749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb18b13e51bd%3A0x8774a1856072a6c1!2sPasco%20%26%20Avenida%20Pav%C3%B3n%2C%20C1256%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1749696887948!5m2!1ses-419!2sar" 
          width="100%" 
          height="100%" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      `
    }
  }, [latitude, longitude, zoom])

  return (
    <div
      ref={mapRef}
      style={{
        width,
        height,
        overflow: "hidden",
        borderRadius: "8px",
      }}
      className={className}
    />
  )
}
