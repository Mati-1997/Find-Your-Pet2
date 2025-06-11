"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, MapPin, Clock } from "lucide-react"

export default function AlertSummary() {
  // Datos de ejemplo para las alertas
  const alerts = [
    {
      id: 1,
      type: "lost",
      petName: "Max",
      location: "Colonia Roma",
      time: "2h",
      urgent: true,
    },
    {
      id: 2,
      type: "found",
      petName: "Luna",
      location: "Parque México",
      time: "4h",
      urgent: false,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Bell className="w-5 h-5 mr-2" />
          Alertas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {alert.type === "lost" ? (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm">😢</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">😊</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {alert.type === "lost" ? "Perdido" : "Encontrado"}: {alert.petName}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {alert.location}
                      <Clock className="w-3 h-3 ml-2 mr-1" />
                      hace {alert.time}
                    </div>
                  </div>
                </div>
                {alert.urgent && (
                  <Badge variant="destructive" className="text-xs">
                    Urgente
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay alertas recientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
