"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Satellite, Battery, Signal, Clock, Play, Pause, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuthCheck } from "@/hooks/use-auth-check"
import MapView from "@/components/map-view"

interface GPSDevice {
  id: string
  name: string
  petName: string
  batteryLevel: number
  signalStrength: number
  isActive: boolean
  lastUpdate: string
  latitude: number
  longitude: number
}

export default function TrackingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuthCheck()
  const [devices, setDevices] = useState<GPSDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<GPSDevice | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: -34.6037, lng: -58.3816 })

  useEffect(() => {
    if (!loading && user) {
      loadGPSDevices()
      getUserLocation()
    }
  }, [loading, user])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Error getting location:", error)
        },
      )
    }
  }

  const loadGPSDevices = async () => {
    // Simular dispositivos GPS para demo
    const mockDevices: GPSDevice[] = [
      {
        id: "gps-001",
        name: "Collar GPS Max",
        petName: "Max",
        batteryLevel: 85,
        signalStrength: 4,
        isActive: true,
        lastUpdate: new Date().toISOString(),
        latitude: userLocation.lat + 0.002,
        longitude: userLocation.lng + 0.003,
      },
      {
        id: "gps-002",
        name: "Collar GPS Luna",
        petName: "Luna",
        batteryLevel: 45,
        signalStrength: 3,
        isActive: false,
        lastUpdate: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        latitude: userLocation.lat - 0.001,
        longitude: userLocation.lng + 0.002,
      },
    ]

    setDevices(mockDevices)
    if (mockDevices.length > 0) {
      setSelectedDevice(mockDevices[0])
    }
  }

  const toggleTracking = () => {
    setIsTracking(!isTracking)
    toast({
      title: isTracking ? "Rastreo pausado" : "Rastreo iniciado",
      description: isTracking ? "El rastreo GPS ha sido pausado" : "Iniciando rastreo GPS en tiempo real",
    })
  }

  const refreshLocation = () => {
    toast({
      title: "Actualizando ubicación",
      description: "Obteniendo la última ubicación del dispositivo GPS...",
    })

    // Simular actualización de ubicación
    setTimeout(() => {
      if (selectedDevice) {
        const updatedDevice = {
          ...selectedDevice,
          lastUpdate: new Date().toISOString(),
          latitude: selectedDevice.latitude + (Math.random() - 0.5) * 0.001,
          longitude: selectedDevice.longitude + (Math.random() - 0.5) * 0.001,
        }
        setSelectedDevice(updatedDevice)
        setDevices(devices.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)))
      }

      toast({
        title: "Ubicación actualizada",
        description: "Se ha obtenido la última ubicación del dispositivo",
      })
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" className="mr-4 p-0" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Rastreo GPS</h1>
          <div className="ml-auto">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Configurar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {/* Device Status */}
        {selectedDevice && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Satellite className="w-5 h-5 mr-2" />
                  {selectedDevice.name}
                </div>
                <Badge variant={selectedDevice.isActive ? "default" : "secondary"}>
                  {selectedDevice.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Battery className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">{selectedDevice.batteryLevel}%</p>
                    <p className="text-xs text-gray-500">Batería</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Signal className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{selectedDevice.signalStrength}/5</p>
                    <p className="text-xs text-gray-500">Señal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(selectedDevice.lastUpdate).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-gray-500">Última actualización</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">{selectedDevice.petName}</p>
                    <p className="text-xs text-gray-500">Mascota</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-4">
          <Button onClick={toggleTracking} className="flex-1">
            {isTracking ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isTracking ? "Pausar rastreo" : "Iniciar rastreo"}
          </Button>
          <Button variant="outline" onClick={refreshLocation}>
            <MapPin className="w-4 h-4 mr-2" />
            Actualizar ubicación
          </Button>
        </div>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación en tiempo real</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDevice ? (
              <MapView
                petLocations={[
                  {
                    id: selectedDevice.id,
                    name: selectedDevice.petName,
                    latitude: selectedDevice.latitude,
                    longitude: selectedDevice.longitude,
                    timestamp: selectedDevice.lastUpdate,
                    status: "found",
                  },
                ]}
                height="400px"
                initialViewState={{
                  latitude: selectedDevice.latitude,
                  longitude: selectedDevice.longitude,
                  zoom: 15,
                }}
              />
            ) : (
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Satellite className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No hay dispositivos GPS conectados</p>
                  <p className="text-sm mt-2">Conecta un collar GPS para ver la ubicación</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device List */}
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos GPS</CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length > 0 ? (
              <div className="space-y-4">
                {devices.map((device) => (
                  <Card
                    key={device.id}
                    className={`cursor-pointer transition-colors ${
                      selectedDevice?.id === device.id ? "border-primary" : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Satellite className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{device.name}</h3>
                            <p className="text-sm text-gray-500">Mascota: {device.petName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={device.isActive ? "default" : "secondary"}>
                            {device.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">Batería: {device.batteryLevel}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Satellite className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No hay dispositivos GPS registrados</p>
                <p className="text-sm mt-2">Conecta tu primer collar GPS</p>
                <Button
                  className="mt-4"
                  onClick={() =>
                    toast({ title: "Próximamente", description: "Función de agregar dispositivo en desarrollo" })
                  }
                >
                  Agregar dispositivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
