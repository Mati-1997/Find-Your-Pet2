"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ActivityData = {
  date: string
  distance: number
  duration: number
  count: number
}

type ActivityChartProps = {
  data: ActivityData[]
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const [period, setPeriod] = useState("week")

  // Función para dibujar el gráfico de barras
  const renderBarChart = (data: ActivityData[], metric: "distance" | "duration" | "count") => {
    const maxValue = Math.max(...data.map((item) => item[metric]))

    return (
      <div className="h-64 flex items-end space-x-2">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item[metric] / maxValue) * 100 : 0

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex justify-center mb-1">
                <div
                  className="bg-blue-500 rounded-t-md w-full max-w-[30px]"
                  style={{ height: `${percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 truncate w-full text-center">{item.date.split(" ")[0]}</div>
            </div>
          )
        })}
      </div>
    )
  }

  // Función para renderizar el gráfico de línea
  const renderLineChart = (data: ActivityData[], metric: "distance" | "duration" | "count") => {
    if (data.length < 2) return <div className="h-64 flex items-center justify-center">Datos insuficientes</div>

    const maxValue = Math.max(...data.map((item) => item[metric]))
    const points = data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * 100
        const y = maxValue > 0 ? 100 - (item[metric] / maxValue) * 100 : 0
        return `${x},${y}`
      })
      .join(" ")

    return (
      <div className="h-64 relative">
        {/* Líneas de cuadrícula */}
        <div className="absolute inset-0 grid grid-rows-4 w-full h-full">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-gray-200 w-full"></div>
          ))}
        </div>

        {/* SVG para el gráfico de línea */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos en la línea */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = maxValue > 0 ? 100 - (item[metric] / maxValue) * 100 : 0
            return <circle key={index} cx={x} cy={y} r="2" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
          })}
        </svg>

        {/* Etiquetas de fechas */}
        <div className="absolute bottom-0 w-full flex justify-between px-2 text-xs text-gray-500">
          {data.map((item, index) => (
            <div key={index} className={index === 0 || index === data.length - 1 ? "block" : "hidden md:block"}>
              {item.date.split(" ")[0]}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Función para formatear valores
  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case "distance":
        return `${value.toFixed(1)} km`
      case "duration":
        return `${Math.floor(value / 60)}h ${value % 60}m`
      case "count":
        return value.toString()
      default:
        return value.toString()
    }
  }

  // Calcular estadísticas
  const calculateStats = (data: ActivityData[], metric: "distance" | "duration" | "count") => {
    if (data.length === 0) return { total: 0, avg: 0, max: 0 }

    const total = data.reduce((sum, item) => sum + item[metric], 0)
    const avg = total / data.length
    const max = Math.max(...data.map((item) => item[metric]))

    return { total, avg, max }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Actividad de la mascota</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distance">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="distance">Distancia</TabsTrigger>
            <TabsTrigger value="duration">Duración</TabsTrigger>
            <TabsTrigger value="count">Frecuencia</TabsTrigger>
          </TabsList>

          <TabsContent value="distance" className="space-y-4">
            {renderLineChart(data, "distance")}

            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.entries(calculateStats(data, "distance")).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-xs text-gray-500">
                    {key === "total" ? "Total" : key === "avg" ? "Promedio" : "Máximo"}
                  </div>
                  <div className="font-medium">{formatValue(value, "distance")}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="duration" className="space-y-4">
            {renderBarChart(data, "duration")}

            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.entries(calculateStats(data, "duration")).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-xs text-gray-500">
                    {key === "total" ? "Total" : key === "avg" ? "Promedio" : "Máximo"}
                  </div>
                  <div className="font-medium">{formatValue(value, "duration")}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="count" className="space-y-4">
            {renderBarChart(data, "count")}

            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.entries(calculateStats(data, "count")).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-xs text-gray-500">
                    {key === "total" ? "Total" : key === "avg" ? "Promedio" : "Máximo"}
                  </div>
                  <div className="font-medium">{formatValue(value, "count")}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
