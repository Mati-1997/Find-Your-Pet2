"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Bell, Check, X, MapPin, Clock, AlertTriangle, Info } from "lucide-react"
import {
  type Alert,
  type AlertStatus,
  getAlerts,
  updateAlertStatus,
  getSeverityColor,
  getStatusColor,
} from "@/lib/alert-service"
import { useToast } from "@/components/ui/use-toast"

type AlertHistoryProps = {
  petId?: string
  limit?: number
  showTabs?: boolean
  onAlertClick?: (alert: Alert) => void
}

export default function AlertHistory({ petId, limit, showTabs = true, onAlertClick }: AlertHistoryProps) {
  const [activeTab, setActiveTab] = useState<AlertStatus | "all">("all")
  const [alerts, setAlerts] = useState<Alert[]>(getAlerts(petId))
  const { toast } = useToast()

  const handleStatusChange = (alertId: string, newStatus: AlertStatus) => {
    const updatedAlert = updateAlertStatus(alertId, newStatus)
    if (updatedAlert) {
      setAlerts(alerts.map((alert) => (alert.id === alertId ? updatedAlert : alert)))

      // Mostrar mensaje de confirmación
      const statusMessages = {
        resolved: "Alerta marcada como resuelta",
        ignored: "Alerta ignorada",
        active: "Alerta marcada como activa",
      }

      toast({
        title: statusMessages[newStatus],
        description: `La alerta "${updatedAlert.title}" ha sido actualizada.`,
        duration: 3000,
      })
    }
  }

  const filteredAlerts = activeTab === "all" ? alerts : alerts.filter((alert) => alert.status === activeTab)

  const displayAlerts = limit ? filteredAlerts.slice(0, limit) : filteredAlerts

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "medium":
        return <Info className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      {showTabs && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AlertStatus | "all")}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="resolved">Resueltas</TabsTrigger>
            <TabsTrigger value="ignored">Ignoradas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-3 mt-4">
              {displayAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No hay alertas {activeTab !== "all" ? `${activeTab}s` : ""}</p>
                </div>
              ) : (
                displayAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className="overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={() => onAlertClick && onAlertClick(alert)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 ${getSeverityColor(alert.severity).replace("bg-", "bg-opacity-20 bg-")}`}
                        >
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <h4 className="font-medium text-sm">{alert.title}</h4>
                              <Badge className={`ml-2 ${getStatusColor(alert.status)}`}>{alert.status}</Badge>
                            </div>
                            <div className="flex space-x-1">
                              {alert.status === "active" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStatusChange(alert.id, "resolved")
                                    }}
                                    title="Marcar como resuelta"
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStatusChange(alert.id, "ignored")
                                    }}
                                    title="Ignorar alerta"
                                  >
                                    <X className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </>
                              )}
                              {alert.status !== "active" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(alert.id, "active")
                                  }}
                                  title="Reactivar alerta"
                                >
                                  <Bell className="h-4 w-4 text-blue-500" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            {alert.location && (
                              <>
                                <MapPin className="w-3 h-3 ml-2 mr-1" />
                                <span>
                                  {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!showTabs && (
        <div className="space-y-3">
          {displayAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No hay alertas</p>
            </div>
          ) : (
            displayAlerts.map((alert) => (
              <Card
                key={alert.id}
                className="overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => onAlertClick && onAlertClick(alert)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 ${getSeverityColor(alert.severity).replace("bg-", "bg-opacity-20 bg-")}`}
                    >
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <Badge className={`ml-2 ${getStatusColor(alert.status)}`}>{alert.status}</Badge>
                        </div>
                        <div className="flex space-x-1">
                          {alert.status === "active" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(alert.id, "resolved")
                                }}
                                title="Marcar como resuelta"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(alert.id, "ignored")
                                }}
                                title="Ignorar alerta"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        {alert.location && (
                          <>
                            <MapPin className="w-3 h-3 ml-2 mr-1" />
                            <span>
                              {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
