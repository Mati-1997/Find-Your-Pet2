"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { createClient } from "@/utils/supabase/client"
import { useUser } from "@/components/providers/UserProvider"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

// Fix: Marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
})

const TrackingPage = () => {
  const [pets, setPets] = useState([])
  const { user } = useUser()
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    const loadUserPets = async () => {
      if (!user?.id) return

      try {
        const supabase = createClient()
        const { data: petsData, error } = await supabase
          .from("pets")
          .select("*")
          .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
          .order("created_at", { ascending: false })

        if (error) throw error

        const petsWithLocations = (petsData || []).map((pet, index) => ({
          ...pet,
          latitude: -34.6037 + (Math.random() - 0.5) * 0.05,
          longitude: -58.3816 + (Math.random() - 0.5) * 0.05,
          lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          batteryLevel: Math.floor(Math.random() * 100),
          isActive: Math.random() > 0.3,
        }))

        setPets(petsWithLocations)
      } catch (error) {
        console.error("Error loading pets:", error)
      }
    }

    loadUserPets()
  }, [user?.id])

  const mapCenter = [-34.6037, -58.3816] // Buenos Aires

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className={`p-4 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-blue-600 text-white"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/20 p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Seguimiento GPS</h1>
              <p className="text-blue-100">Ubicación en tiempo real de tus mascotas</p>
            </div>
          </div>
          <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-white hover:bg-white/20">
            <Home className="w-5 h-5 mr-2" />
            Inicio
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-grow">
        <MapContainer center={mapCenter} zoom={13} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            url={
              theme === "dark"
                ? "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {pets.map((pet, index) => (
            <Marker key={index} position={[pet.latitude, pet.longitude]}>
              <Popup>
                <div>
                  <h3 className="font-bold">{pet.name}</h3>
                  <p>Última actualización: {new Date(pet.lastUpdate).toLocaleTimeString()}</p>
                  <p>Batería: {pet.batteryLevel}%</p>
                  <p>Estado: {pet.isActive ? "Activo" : "Inactivo"}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default TrackingPage
