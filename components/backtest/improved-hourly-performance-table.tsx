"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { HourStats } from "@/lib/types"

interface ImprovedHourlyPerformanceTableProps {
  hourStats: Record<string, HourStats>
}

export function ImprovedHourlyPerformanceTable({ hourStats }: ImprovedHourlyPerformanceTableProps) {
  // Filter out hours with no trades and sort by hour
  const filteredHourStats = Object.entries(hourStats)
    .filter(([, stats]) => stats.TRADES > 0)
    .sort((a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0]))

  if (filteredHourStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Hora del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No hay datos de trading por horas disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatHour = (hour: string) => {
    const hourNum = Number.parseInt(hour)
    return `${hourNum.toString().padStart(2, "0")}:00`
  }

  const getWinrateColor = (winrate: number) => {
    if (winrate >= 60) return "text-green-600 dark:text-green-400"
    if (winrate >= 50) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  const getSessionBadge = (hour: number) => {
    if (hour >= 6 && hour < 12) return { label: "Sesión Europea", variant: "default" as const }
    if (hour >= 12 && hour < 17) return { label: "Overlap EU-US", variant: "secondary" as const }
    if (hour >= 17 && hour < 22) return { label: "Sesión Americana", variant: "outline" as const }
    return { label: "Fuera de horario", variant: "destructive" as const }
  }

  const maxTrades = Math.max(...filteredHourStats.map(([, stats]) => stats.TRADES))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Rendimiento por Hora del Día
          <Badge variant="secondary" className="text-xs">
            Solo horas activas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora</TableHead>
              <TableHead>Sesión</TableHead>
              <TableHead className="text-center">Operaciones</TableHead>
              <TableHead className="text-center">Ganadas</TableHead>
              <TableHead className="text-center">Perdidas</TableHead>
              <TableHead className="text-center">Winrate</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">P&L Promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHourStats.map(([hour, stats]) => {
              const hourNum = Number.parseInt(hour)
              const session = getSessionBadge(hourNum)

              return (
                <TableRow key={hour} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {formatHour(hour)}
                      <div className="w-16">
                        <Progress value={(stats.TRADES / maxTrades) * 100} className="h-1" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={session.variant} className="text-xs">
                      {session.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{stats.TRADES}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-green-600 dark:text-green-400 font-medium">{stats.WINS}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-red-600 dark:text-red-400 font-medium">{stats.LOSSES}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={getWinrateColor(stats.WINRATE)}>{stats.WINRATE.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getProfitColor(stats["P&L"])}`}>
                    {formatCurrency(stats["P&L"])}
                  </TableCell>
                  <TableCell className={`text-right ${getProfitColor(stats["AVG_P&L"])}`}>
                    {formatCurrency(stats["AVG_P&L"])}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Solo se muestran las horas con operaciones registradas. Las sesiones se clasifican automáticamente según
            el horario de mercado.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
