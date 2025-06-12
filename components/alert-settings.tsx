"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  type AlertSettings,
  type AlertSeverity,
  getAlertSettings,
  getAlertTypeName,
  getAlertTypeIcon,
} from "@/lib/alert-service"
import { Settings2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type AlertSettingsProps = {
  petId?: string
  onSettingsChange?: (settings: AlertSettings[]) => void
}

export default function AlertSettingsComponent({ petId, onSettingsChange }: AlertSettingsProps) {
  const [settings, setSettings] = useState<AlertSettings[]>(getAlertSettings())
  const [activeTab, setActiveTab] = useState<"all" | "enabled" | "disabled">("all")
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  const handleToggle = (settingId: string, enabled: boolean) => {
    const updatedSettings = settings.map((setting) => (setting.id === settingId ? { ...setting, enabled } : setting))
    setSettings(updatedSettings)
    setHasChanges(true)
    onSettingsChange && onSettingsChange(updatedSettings)
  }

  const handleThresholdChange = (settingId: string, threshold: number) => {
    const updatedSettings = settings.map((setting) => (setting.id === settingId ? { ...setting, threshold } : setting))
    setSettings(updatedSettings)
    setHasChanges(true)
    onSettingsChange && onSettingsChange(updatedSettings)
  }

  const handleSaveChanges = () => {
    // En una aplicación real, aquí guardaríamos los cambios en la base de datos
    setHasChanges(false)
    toast({
      title: "Configuración guardada",
      description: "Los cambios en la configuración de alertas han sido guardados.",
      duration: 3000,
    })
  }

  const filteredSettings =
    activeTab === "all"
      ? settings
      : settings.filter((setting) => (activeTab === "enabled" ? setting.enabled : !setting.enabled))

  const getThresholdLabel = (setting: AlertSettings): string => {
    switch (setting.type) {
      case "inactivity":
      case "no_movement":
        return `${setting.threshold} horas`
      case "excessive_movement":
        return `${setting.threshold} minutos`
      case "battery_low":
      case "health_pattern":
        return `${setting.threshold}%`
      case "speed_alert":
        return `${setting.threshold} km/h`
      case "geofence":
        return `${setting.geofenceRadius || 500}m`
      default:
        return `${setting.threshold}`
    }
  }

  const getSeverityBadge = (severity: AlertSeverity) => {
    const colors = {
      low: "bg-blue-500",
      medium: "bg-yellow-500",
      high: "bg-red-500",
    }

    return <Badge className={colors[severity]}>{severity}</Badge>
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Settings2 className="w-5 h-5 mr-2" />
            Configuración de alertas
          </CardTitle>
          {hasChanges && (
            <Button size="sm" onClick={handleSaveChanges} className="flex items-center">
              <Save className="w-4 h-4 mr-1" />
              Guardar cambios
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "enabled" | "disabled")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="enabled">Activadas</TabsTrigger>
            <TabsTrigger value="disabled">Desactivadas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-4">
              {filteredSettings.map((setting) => (
                <Card key={setting.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getAlertTypeIcon(setting.type)}</span>
                        <h3 className="font-medium">{getAlertTypeName(setting.type)}</h3>
                      </div>
                      <Switch
                        checked={setting.enabled}
                        onCheckedChange={(checked) => handleToggle(setting.id, checked)}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Severidad:</span>
                        {getSeverityBadge(setting.severity)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Umbral:</span>
                          <span className="font-medium">{getThresholdLabel(setting)}</span>
                        </div>
                        <Slider
                          disabled={!setting.enabled}
                          value={[setting.threshold]}
                          min={0}
                          max={
                            setting.type === "inactivity" || setting.type === "no_movement"
                              ? 24
                              : setting.type === "excessive_movement"
                                ? 180
                                : setting.type === "battery_low" || setting.type === "health_pattern"
                                  ? 100
                                  : setting.type === "speed_alert"
                                    ? 30
                                    : setting.type === "geofence"
                                      ? 1000
                                      : 10
                          }
                          step={1}
                          onValueChange={(value) => handleThresholdChange(setting.id, value[0])}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Notificar vía:</span>
                        <div className="flex space-x-1">
                          {setting.notifyVia.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method === "push" ? "Push" : method === "email" ? "Email" : "SMS"}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {setting.type === "geofence" && setting.geofenceCenter && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Centro:</span>
                          <span className="text-xs">
                            {setting.geofenceCenter.lat.toFixed(4)}, {setting.geofenceCenter.lng.toFixed(4)}
                          </span>
                        </div>
                      )}

                      {setting.timeWindow && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Ventana de tiempo:</span>
                          <span>
                            {setting.timeWindow >= 60
                              ? `${Math.floor(setting.timeWindow / 60)}h ${setting.timeWindow % 60}m`
                              : `${setting.timeWindow}m`}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
