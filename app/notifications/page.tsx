"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, ArrowLeft, Check, Trash2, Heart, AlertTriangle } from "lucide-react"
import { useAuthCheck } from "@/hooks/use-auth-check"

export default function NotificationsPage() {
  const router = useRouter()
  const { user, loading } = useAuthCheck()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return

      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        // Obtener mascotas del usuario para crear notificaciones
        const { data: pets } = await supabase
          .from("pets")
          .select("*")
          .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
          .order("created_at", { ascending: false })

        if (pets) {
          const petNotifications = pets.map((pet) => ({
            id: `pet-${pet.id}`,
            type: pet.is_lost ? "pet_lost" : "pet_registered",
            title: pet.is_lost ? `${pet.name} reportado como perdido` : `${pet.name} registrado exitosamente`,
            message: pet.is_lost
              ? `Tu mascota ${pet.name} ha sido reportada como perdida en ${pet.last_seen_location || "ubicación desconocida"}`
              : `Tu mascota ${pet.name} (${pet.species || "mascota"}) ha sido registrada en el sistema correctamente`,
            timestamp: new Date(pet.created_at).toLocaleString(),
            read: false,
            icon: pet.is_lost ? "🚨" : "✅",
            petId: pet.id,
          }))

          setNotifications(petNotifications)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()
  }, [user?.id])

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "pet_lost":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "pet_registered":
        return <Heart className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "pet_lost":
        return "border-l-red-500 bg-red-50"
      case "pet_registered":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando notificaciones...</p>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Notificaciones</h1>
                <p className="text-blue-100">{unreadCount > 0 ? `${unreadCount} sin leer` : "Todas leídas"}</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl ${getNotificationColor(
                  notification.type,
                )} ${!notification.read ? "ring-2 ring-blue-200" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.read && <Badge className="bg-blue-500 text-white text-xs">Nuevo</Badge>}
                        </div>
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{notification.timestamp}</span>
                          <div className="flex items-center space-x-2">
                            {notification.petId && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/pet-detail?id=${notification.petId}`)}
                              >
                                Ver mascota
                              </Button>
                            )}
                            {!notification.read && (
                              <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No tienes notificaciones</h3>
              <p className="text-gray-500 mb-6">Cuando registres mascotas o recibas alertas, aparecerán aquí</p>
              <Button
                onClick={() => router.push("/report")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Reportar tu primera mascota
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
