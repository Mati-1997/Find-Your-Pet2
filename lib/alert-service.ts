import type { PetLocation } from "./location-service"

export type AlertType =
  | "inactivity"
  | "excessive_movement"
  | "unusual_location"
  | "battery_low"
  | "geofence"
  | "unusual_time"
  | "speed_alert"
  | "no_movement"
  | "health_pattern"

export type AlertSeverity = "low" | "medium" | "high"

export type AlertStatus = "active" | "resolved" | "ignored"

export interface AlertSettings {
  id: string
  type: AlertType
  enabled: boolean
  threshold: number
  severity: AlertSeverity
  notifyVia: ("push" | "email" | "sms")[]
  timeWindow?: number // en minutos
  geofenceRadius?: number // en metros
  geofenceCenter?: { lat: number; lng: number }
  timeRestriction?: { start: string; end: string }[] // formato "HH:MM"
  daysActive?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[]
}

export interface Alert {
  id: string
  petId: string
  petName: string
  type: AlertType
  title: string
  description: string
  timestamp: string
  severity: AlertSeverity
  status: AlertStatus
  location?: { lat: number; lng: number }
  value?: number
  threshold?: number
  relatedLocations?: PetLocation[]
}

// Datos de ejemplo para alertas
const sampleAlerts: Alert[] = [
  {
    id: "a1",
    petId: "1",
    petName: "Max",
    type: "inactivity",
    title: "Inactividad prolongada",
    description: "Max ha estado inactivo por más de 8 horas, lo cual es inusual para sus patrones normales.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
    severity: "medium",
    status: "active",
    value: 8,
    threshold: 6,
  },
  {
    id: "a2",
    petId: "1",
    petName: "Max",
    type: "unusual_location",
    title: "Ubicación inusual",
    description: "Max se encuentra en una zona que no ha visitado antes.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 horas atrás
    severity: "low",
    status: "resolved",
    location: { lat: 19.4366, lng: -99.1372 },
  },
  {
    id: "a3",
    petId: "1",
    petName: "Max",
    type: "battery_low",
    title: "Batería baja",
    description: "La batería del collar de Max está por debajo del 20%.",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 horas atrás
    severity: "high",
    status: "active",
    value: 15,
    threshold: 20,
  },
  {
    id: "a4",
    petId: "1",
    petName: "Max",
    type: "geofence",
    title: "Salida de zona segura",
    description: "Max ha salido de la zona segura definida.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 horas atrás
    severity: "high",
    status: "resolved",
    location: { lat: 19.4426, lng: -99.1232 },
  },
  {
    id: "a5",
    petId: "1",
    petName: "Max",
    type: "unusual_time",
    title: "Actividad en horario inusual",
    description: "Max está activo a las 3 AM, lo cual es inusual.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 horas atrás
    severity: "medium",
    status: "ignored",
  },
  {
    id: "a6",
    petId: "1",
    petName: "Max",
    type: "health_pattern",
    title: "Cambio en patrón de actividad",
    description: "La actividad diaria de Max ha disminuido un 40% en los últimos 3 días.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 día atrás
    severity: "high",
    status: "active",
    value: 40,
    threshold: 30,
  },
  {
    id: "a7",
    petId: "4",
    petName: "Luna",
    type: "excessive_movement",
    title: "Movimiento excesivo",
    description: "Luna ha estado muy activa durante las últimas 2 horas sin descanso.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutos atrás
    severity: "medium",
    status: "active",
    value: 120,
    threshold: 90,
  },
]

// Configuraciones de alerta predeterminadas
export const defaultAlertSettings: AlertSettings[] = [
  {
    id: "s1",
    type: "inactivity",
    enabled: true,
    threshold: 6, // horas
    severity: "medium",
    notifyVia: ["push", "email"],
    timeWindow: 360, // 6 horas
  },
  {
    id: "s2",
    type: "excessive_movement",
    enabled: true,
    threshold: 90, // minutos
    severity: "medium",
    notifyVia: ["push"],
    timeWindow: 120, // 2 horas
  },
  {
    id: "s3",
    type: "unusual_location",
    enabled: true,
    threshold: 0, // cualquier ubicación nueva
    severity: "low",
    notifyVia: ["push"],
  },
  {
    id: "s4",
    type: "battery_low",
    enabled: true,
    threshold: 20, // porcentaje
    severity: "high",
    notifyVia: ["push", "email", "sms"],
  },
  {
    id: "s5",
    type: "geofence",
    enabled: true,
    threshold: 0, // cualquier salida
    severity: "high",
    notifyVia: ["push", "sms"],
    geofenceRadius: 500, // 500 metros
    geofenceCenter: { lat: 19.4326, lng: -99.1332 },
  },
  {
    id: "s6",
    type: "unusual_time",
    enabled: false,
    threshold: 0,
    severity: "medium",
    notifyVia: ["push"],
    timeRestriction: [{ start: "23:00", end: "06:00" }],
  },
  {
    id: "s7",
    type: "speed_alert",
    enabled: false,
    threshold: 15, // km/h
    severity: "medium",
    notifyVia: ["push"],
  },
  {
    id: "s8",
    type: "no_movement",
    enabled: false,
    threshold: 12, // horas
    severity: "high",
    notifyVia: ["push", "email", "sms"],
    timeWindow: 720, // 12 horas
  },
  {
    id: "s9",
    type: "health_pattern",
    enabled: true,
    threshold: 30, // porcentaje de cambio
    severity: "high",
    notifyVia: ["push", "email"],
    timeWindow: 4320, // 3 días
  },
]

// Obtener todas las alertas
export const getAlerts = (petId?: string, status?: AlertStatus): Alert[] => {
  let alerts = [...sampleAlerts]

  if (petId) {
    alerts = alerts.filter((alert) => alert.petId === petId)
  }

  if (status) {
    alerts = alerts.filter((alert) => alert.status === status)
  }

  // Ordenar por timestamp (más reciente primero)
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Obtener alertas activas
export const getActiveAlerts = (petId?: string): Alert[] => {
  return getAlerts(petId, "active")
}

// Obtener configuraciones de alerta
export const getAlertSettings = (): AlertSettings[] => {
  return [...defaultAlertSettings]
}

// Actualizar estado de una alerta
export const updateAlertStatus = (alertId: string, status: AlertStatus): Alert | null => {
  const alertIndex = sampleAlerts.findIndex((alert) => alert.id === alertId)
  if (alertIndex === -1) return null

  // En una aplicación real, esto actualizaría la base de datos
  const updatedAlert = { ...sampleAlerts[alertIndex], status }
  sampleAlerts[alertIndex] = updatedAlert

  return updatedAlert
}

// Función para detectar patrones anormales (simulada)
export const detectAbnormalPatterns = (locations: PetLocation[], settings: AlertSettings[]): Alert[] => {
  // En una aplicación real, esta función analizaría los datos de ubicación
  // y detectaría patrones anormales basados en las configuraciones

  // Para la demostración, simplemente devolvemos las alertas activas
  return getActiveAlerts()
}

// Obtener el nombre legible de un tipo de alerta
export const getAlertTypeName = (type: AlertType): string => {
  const typeNames: Record<AlertType, string> = {
    inactivity: "Inactividad prolongada",
    excessive_movement: "Movimiento excesivo",
    unusual_location: "Ubicación inusual",
    battery_low: "Batería baja",
    geofence: "Salida de zona segura",
    unusual_time: "Actividad en horario inusual",
    speed_alert: "Alerta de velocidad",
    no_movement: "Sin movimiento",
    health_pattern: "Cambio en patrón de salud",
  }

  return typeNames[type] || type
}

// Obtener el ícono para un tipo de alerta
export const getAlertTypeIcon = (type: AlertType): string => {
  const typeIcons: Record<AlertType, string> = {
    inactivity: "⚠️",
    excessive_movement: "🏃",
    unusual_location: "🗺️",
    battery_low: "🔋",
    geofence: "🚧",
    unusual_time: "🕒",
    speed_alert: "⚡",
    no_movement: "😴",
    health_pattern: "❤️",
  }

  return typeIcons[type] || "📢"
}

// Obtener el color para una severidad
export const getSeverityColor = (severity: AlertSeverity): string => {
  const severityColors: Record<AlertSeverity, string> = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  }

  return severityColors[severity] || "bg-gray-500"
}

// Obtener el color para un estado
export const getStatusColor = (status: AlertStatus): string => {
  const statusColors: Record<AlertStatus, string> = {
    active: "bg-red-500",
    resolved: "bg-green-500",
    ignored: "bg-gray-500",
  }

  return statusColors[status] || "bg-gray-500"
}
