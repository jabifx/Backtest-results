"use client"

import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Trade } from "@/lib/types"

// Register Chart.js components
Chart.register(...registerables)

interface WinrateHeatmapProps {
  trades: Trade[]
}

export function WinrateHeatmap({ trades }: WinrateHeatmapProps) {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")

  // Días de la semana
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const dayTranslations: Record<string, string> = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
  }

  // Horas del día (solo las horas de trading)
  const tradingHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  // Inicializar contadores para cada combinación día-hora
  const tradesByDayHour: Record<string, { wins: number; total: number; winrate: number }> = {}

  // Contar operaciones por día y hora
  trades.forEach((trade) => {
    const day = trade.DAY_OF_WEEK
    const hour = trade.HOUR_OF_DAY

    // Solo procesar días y horas que nos interesan
    if (!days.includes(day) || !tradingHours.includes(hour)) return

    const key = `${day}-${hour}`

    if (!tradesByDayHour[key]) {
      tradesByDayHour[key] = { wins: 0, total: 0, winrate: 0 }
    }

    tradesByDayHour[key].total++
    if (trade.RESULTADO === "TP") {
      tradesByDayHour[key].wins++
    }
  })

  // Calcular winrate para cada combinación
  Object.keys(tradesByDayHour).forEach((key) => {
    const stats = tradesByDayHour[key]
    stats.winrate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0
  })

  // Función para obtener el color de fondo según el winrate
  const getWinrateColor = (winrate: number, opacity = 0.2) => {
    if (winrate < 40) return `rgba(239, 68, 68, ${opacity})` // Rojo
    if (winrate < 50) return `rgba(249, 115, 22, ${opacity})` // Naranja
    if (winrate < 60) return `rgba(234, 179, 8, ${opacity})` // Amarillo
    if (winrate < 70) return `rgba(132, 204, 22, ${opacity})` // Verde claro
    return `rgba(34, 197, 94, ${opacity})` // Verde
  }

  // Función para obtener el color de texto según el winrate
  const getWinrateTextColor = (winrate: number) => {
    if (winrate < 40) return "text-red-500"
    if (winrate < 50) return "text-orange-500"
    if (winrate < 60) return "text-yellow-500"
    if (winrate < 70) return "text-lime-500"
    return "text-green-500"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="flex border rounded-md p-0.5 w-fit">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Tabla
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "chart" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Gráfico
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Día / Hora</TableHead>
                {tradingHours.map((hour) => (
                  <TableHead key={hour} className="text-center">
                    {hour}:00
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {days.map((day) => (
                <TableRow key={day}>
                  <TableCell className="font-medium">{dayTranslations[day]}</TableCell>
                  {tradingHours.map((hour) => {
                    const key = `${day}-${hour}`
                    const stats = tradesByDayHour[key]

                    if (!stats || stats.total < 3) {
                      return (
                        <TableCell key={hour} className="text-center text-muted-foreground">
                          -
                        </TableCell>
                      )
                    }

                    return (
                      <TableCell
                        key={hour}
                        className="text-center p-0"
                        style={{ backgroundColor: getWinrateColor(stats.winrate) }}
                      >
                        <div className="p-2">
                          <div className={`font-medium ${getWinrateTextColor(stats.winrate)}`}>
                            {stats.winrate.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stats.wins}/{stats.total}
                          </div>
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day} className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3">{dayTranslations[day]}</h3>
              <div className="space-y-2">
                {tradingHours.map((hour) => {
                  const key = `${day}-${hour}`
                  const stats = tradesByDayHour[key]

                  if (!stats || stats.total < 3) {
                    return null
                  }

                  return (
                    <div key={hour} className="flex items-center gap-2">
                      <div className="w-16 text-sm">{hour}:00</div>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded-md flex items-center px-2"
                          style={{ backgroundColor: getWinrateColor(stats.winrate, 0.7) }}
                        >
                          <span className="text-xs font-medium text-white">
                            {stats.winrate.toFixed(0)}% ({stats.wins}/{stats.total})
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Leyenda:</span>
          <Badge className="bg-red-500">{"<40%"}</Badge>
          <Badge className="bg-orange-500">40-50%</Badge>
          <Badge className="bg-yellow-500">50-60%</Badge>
          <Badge className="bg-lime-500">60-70%</Badge>
          <Badge className="bg-green-500">{">70%"}</Badge>
        </div>
      </div>
    </div>
  )
}
