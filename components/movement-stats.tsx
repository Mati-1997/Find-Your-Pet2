import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Activity, Calendar, Zap } from "lucide-react"

type MovementStatsProps = {
  totalDistance: number
  avgSpeed: number
  activeTime: number
  restTime: number
  activePercentage: number
  mostActiveTime: string
  mostActiveDay: string
  longestTrip: number
  lastUpdate: string
}

export default function MovementStats({
  totalDistance,
  avgSpeed,
  activeTime,
  restTime,
  activePercentage,
  mostActiveTime,
  mostActiveDay,
  longestTrip,
  lastUpdate,
}: MovementStatsProps) {
  // Formatear tiempo activo
  const formatActiveTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Estadísticas de movimiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<MapPin className="w-4 h-4 text-blue-500" />}
            title="Distancia total"
            value={`${totalDistance.toFixed(1)} km`}
          />
          <StatCard
            icon={<Zap className="w-4 h-4 text-yellow-500" />}
            title="Velocidad promedio"
            value={`${avgSpeed.toFixed(1)} km/h`}
          />
          <StatCard
            icon={<Activity className="w-4 h-4 text-green-500" />}
            title="Tiempo activo"
            value={formatActiveTime(activeTime)}
          />
          <StatCard
            icon={<Clock className="w-4 h-4 text-red-500" />}
            title="Tiempo de descanso"
            value={formatActiveTime(restTime)}
          />
        </div>

        <div className="pt-2 border-t">
          <div className="text-sm font-medium mb-2">Actividad</div>
          <div className="space-y-3">
            <ActivityStat
              icon={<Activity className="w-4 h-4 text-blue-500" />}
              title="Nivel de actividad"
              value={`${activePercentage}%`}
              progress={activePercentage}
            />
            <InfoStat
              icon={<Clock className="w-4 h-4 text-purple-500" />}
              title="Hora más activa"
              value={mostActiveTime}
            />
            <InfoStat
              icon={<Calendar className="w-4 h-4 text-indigo-500" />}
              title="Día más activo"
              value={mostActiveDay}
            />
            <InfoStat
              icon={<MapPin className="w-4 h-4 text-green-500" />}
              title="Viaje más largo"
              value={`${longestTrip.toFixed(1)} km`}
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">Última actualización: {lastUpdate}</div>
      </CardContent>
    </Card>
  )
}

// Componente para una tarjeta de estadística
function StatCard({ icon, title, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center mb-1">
        {icon}
        <span className="text-xs text-gray-500 ml-1">{title}</span>
      </div>
      <div className="text-lg font-medium">{value}</div>
    </div>
  )
}

// Componente para una estadística con barra de progreso
function ActivityStat({ icon, title, value, progress }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <span className="text-xs ml-1">{title}</span>
        </div>
        <Badge variant="outline">{value}</Badge>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}

// Componente para una estadística informativa
function InfoStat({ icon, title, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {icon}
        <span className="text-xs ml-1">{title}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
