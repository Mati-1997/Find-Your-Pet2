"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Settings2, AlertTriangle, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AlertHistory from "@/components/alert-history"
import AlertSettingsComponent from "@/components/alert-settings"
import { type Alert, getActiveAlerts, updateAlertStatus } from "@/lib/alert-service"
import { useToast } from "@/components/ui/use-toast"

export default function AlertsPage() {
  const router = useRouter()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [activeAlerts, setActiveAlerts] = useState(getActiveAlerts())
  const [activeTab, setActiveTab] = useState("history")
  const { toast } = useToast()

  const handleAlertStatusChange = (alertId: string, status: "resolved" | "ignored") => {
    const updatedAlert = updateAlertStatus(alertId, status)
    if (updatedAlert) {
      setSelectedAlert(null)
      setActiveAlerts(getActiveAlerts())

      toast({
        title: status === "resolved" ? "Alerta resuelta" : "Alerta ignorada",
        description: `La alerta ha sido marcada como ${status}.`,
        duration: 3000,
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" className="mr-4 p-0" onClick={() => router.push("/home")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Alertas y notificaciones</h1>
          {activeAlerts.length > 0 && <Badge className="ml-2 bg-red-500">{activeAlerts.length}</Badge>}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <div className="space-y-6">
          {/* Resumen de alertas activas */}
          {activeAlerts.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800">Alertas activas</h3>
                    <p className="text-sm text-red-700">
                      Tienes {activeAlerts.length} alerta{activeAlerts.length !== 1 ? "s" : ""} activa
                      {activeAlerts.length !== 1 ? "s" : ""} que requiere{activeAlerts.length !== 1 ? "n" : ""} tu
                      atención.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pestañas principales */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history" className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings2 className="w-4 h-4 mr-2" />
                Configuración
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-4 space-y-4">
              <AlertHistory onAlertClick={setSelectedAlert} />
            </TabsContent>

            <TabsContent value="settings" className="mt-4 space-y-4">
              <AlertSettingsComponent />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Modal de detalle de alerta */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{selectedAlert.title}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-700 mb-4">{selectedAlert.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mascota:</span>
                  <span>{selectedAlert.petName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha:</span>
                  <span>{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                </div>
                {selectedAlert.value !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valor:</span>
                    <span>
                      {selectedAlert.value} {selectedAlert.threshold ? `(umbral: ${selectedAlert.threshold})` : ""}
                    </span>
                  </div>
                )}
                {selectedAlert.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ubicación:</span>
                    <span>
                      {selectedAlert.location.lat.toFixed(4)}, {selectedAlert.location.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-2">
                <Button className="flex-1" variant="outline" onClick={() => setSelectedAlert(null)}>
                  Cerrar
                </Button>
                {selectedAlert.status === "active" && (
                  <>
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => handleAlertStatusChange(selectedAlert.id, "resolved")}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Resolver
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleAlertStatusChange(selectedAlert.id, "ignored")}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Ignorar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
