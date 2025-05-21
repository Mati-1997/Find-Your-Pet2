"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Bell } from "lucide-react"
import { getActiveAlerts } from "@/lib/alert-service"

export default function AlertSummary() {
  const router = useRouter()
  const activeAlerts = getActiveAlerts()

  if (activeAlerts.length === 0) {
    return null
  }

  // Agrupar alertas por severidad
  const highAlerts = activeAlerts.filter((alert) => alert.severity === "high")
  const mediumAlerts = activeAlerts.filter((alert) => alert.severity === "medium")
  const lowAlerts = activeAlerts.filter((alert) => alert.severity === "low")

  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mr-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Alertas activas</h3>
            <p className="text-sm text-red-700 mb-2">
              Tienes {activeAlerts.length} alerta{activeAlerts.length !== 1 ? "s" : ""} que requiere
              {activeAlerts.length !== 1 ? "n" : ""} tu atención.
            </p>

            <div className="flex space-x-2 mb-3">
              {highAlerts.length > 0 && (
                <Badge className="bg-red-500">
                  {highAlerts.length} alta{highAlerts.length !== 1 ? "s" : ""}
                </Badge>
              )}
              {mediumAlerts.length > 0 && (
                <Badge className="bg-yellow-500">
                  {mediumAlerts.length} media{mediumAlerts.length !== 1 ? "s" : ""}
                </Badge>
              )}
              {lowAlerts.length > 0 && (
                <Badge className="bg-blue-500">
                  {lowAlerts.length} baja{lowAlerts.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {/* Mostrar la alerta más reciente */}
            {activeAlerts.length > 0 && (
              <div className="text-sm text-red-800 mb-3">
                <span className="font-medium">Última alerta: </span>
                {activeAlerts[0].title} - {new Date(activeAlerts[0].timestamp).toLocaleTimeString()}
              </div>
            )}

            <Button size="sm" className="w-full sm:w-auto" onClick={() => router.push("/alerts")}>
              <Bell className="w-4 h-4 mr-2" />
              Ver todas las alertas
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
