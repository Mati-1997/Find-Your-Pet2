export type PetLocation = {
  id: string
  name: string
  latitude: number
  longitude: number
  timestamp: string
  imageUrl?: string
  status: "lost" | "found" | "home"
  speed?: number
  altitude?: number
  batteryLevel?: number
  isMoving?: boolean
}

export type ActivityData = {
  date: string
  distance: number
  duration: number
  count: number
}

// Datos de ejemplo para demostración
export const getSamplePetLocations = (): PetLocation[] => {
  return [
    {
      id: "1",
      name: "Max",
      latitude: 19.4326,
      longitude: -99.1332,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "lost",
      speed: 0,
      altitude: 2240,
      batteryLevel: 85,
      isMoving: false,
    },
    {
      id: "2",
      name: "Max",
      latitude: 19.4346,
      longitude: -99.1352,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "lost",
      speed: 3.2,
      altitude: 2245,
      batteryLevel: 90,
      isMoving: true,
    },
    {
      id: "3",
      name: "Max",
      latitude: 19.4366,
      longitude: -99.1372,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 horas atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "lost",
      speed: 2.8,
      altitude: 2250,
      batteryLevel: 95,
      isMoving: true,
    },
    {
      id: "4",
      name: "Luna",
      latitude: 19.4226,
      longitude: -99.1432,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutos atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "found",
      speed: 0,
      altitude: 2230,
      batteryLevel: 75,
      isMoving: false,
    },
    {
      id: "5",
      name: "Rocky",
      latitude: 19.4426,
      longitude: -99.1232,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutos atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "home",
      speed: 1.5,
      altitude: 2235,
      batteryLevel: 80,
      isMoving: true,
    },
    // Añadir más ubicaciones históricas para Max
    {
      id: "6",
      name: "Max",
      latitude: 19.4356,
      longitude: -99.1362,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 horas atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "lost",
      speed: 1.2,
      altitude: 2248,
      batteryLevel: 98,
      isMoving: true,
    },
    {
      id: "7",
      name: "Max",
      latitude: 19.4336,
      longitude: -99.1342,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 horas atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "lost",
      speed: 0,
      altitude: 2242,
      batteryLevel: 100,
      isMoving: false,
    },
    {
      id: "8",
      name: "Max",
      latitude: 19.4316,
      longitude: -99.1322,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 día atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "lost",
      speed: 2.5,
      altitude: 2238,
      batteryLevel: 100,
      isMoving: true,
    },
    {
      id: "9",
      name: "Max",
      latitude: 19.4306,
      longitude: -99.1312,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 días atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "lost",
      speed: 1.8,
      altitude: 2236,
      batteryLevel: 90,
      isMoving: true,
    },
    {
      id: "10",
      name: "Max",
      latitude: 19.4296,
      longitude: -99.1302,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 días atrás
      imageUrl: "/placeholder.svg?height=100&width=100",
      status: "home",
      speed: 0,
      altitude: 2235,
      batteryLevel: 85,
      isMoving: false,
    },
  ]
}

// Obtener ubicaciones de una mascota específica
export const getPetLocationHistory = (petId: string): PetLocation[] => {
  // En una aplicación real, esto obtendría datos de una API o base de datos
  const allLocations = getSamplePetLocations()

  // Para la demostración, filtramos por nombre (en una app real sería por ID)
  const petName = allLocations.find((loc) => loc.id === petId)?.name

  if (!petName) return []

  return allLocations.filter((loc) => loc.name === petName)
}

// Obtener la ubicación más reciente de una mascota
export const getLatestPetLocation = (petId: string): PetLocation | null => {
  const locations = getPetLocationHistory(petId)
  if (locations.length === 0) return null

  // Ordenar por timestamp y obtener el más reciente
  return locations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
}

// Calcular la distancia entre dos puntos (fórmula de Haversine)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

// Obtener datos de actividad para una mascota
export const getPetActivityData = (petId: string): ActivityData[] => {
  // En una aplicación real, esto obtendría datos de una API o base de datos
  // Para la demostración, generamos datos aleatorios
  const today = new Date()
  const data: ActivityData[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
      distance: Math.random() * 5 + 0.5, // Entre 0.5 y 5.5 km
      duration: Math.floor(Math.random() * 120) + 30, // Entre 30 y 150 minutos
      count: Math.floor(Math.random() * 5) + 1, // Entre 1 y 5 salidas
    })
  }

  return data
}

// Obtener estadísticas de movimiento para una mascota
export const getPetMovementStats = (petId: string) => {
  const locations = getPetLocationHistory(petId)

  // Calcular distancia total
  let totalDistance = 0
  if (locations.length > 1) {
    const sortedLocations = [...locations].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    for (let i = 0; i < sortedLocations.length - 1; i++) {
      totalDistance += calculateDistance(
        sortedLocations[i].latitude,
        sortedLocations[i].longitude,
        sortedLocations[i + 1].latitude,
        sortedLocations[i + 1].longitude,
      )
    }
  }

  // Para la demostración, generamos algunos datos aleatorios
  const activeTime = Math.floor(Math.random() * 300) + 120 // Entre 2 y 7 horas en minutos
  const restTime = Math.floor(Math.random() * 600) + 600 // Entre 10 y 20 horas en minutos
  const activePercentage = Math.floor((activeTime / (activeTime + restTime)) * 100)

  // Hora más activa (formato 24h)
  const hours = ["06:00-08:00", "08:00-10:00", "16:00-18:00", "18:00-20:00"]
  const mostActiveTime = hours[Math.floor(Math.random() * hours.length)]

  // Día más activo
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  const mostActiveDay = days[Math.floor(Math.random() * days.length)]

  // Viaje más largo
  const longestTrip = Math.max(totalDistance * 0.4, 1.2)

  // Velocidad promedio
  const avgSpeed = totalDistance / (activeTime / 60)

  return {
    totalDistance,
    avgSpeed,
    activeTime,
    restTime,
    activePercentage,
    mostActiveTime,
    mostActiveDay,
    longestTrip,
    lastUpdate: new Date().toLocaleString(),
  }
}
