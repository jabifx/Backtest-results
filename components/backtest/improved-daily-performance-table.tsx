"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { DayStats } from "@/lib/types"

interface ImprovedDailyPerformanceTableProps {
  dayStats: Record<string, DayStats>
}

export function ImprovedDailyPerformanceTable({ dayStats }: ImprovedDailyPerformanceTableProps) {
  // Filter out weekends and days with no trades
  const tradingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const filteredDayStats = Object.entries(dayStats)
    .filter(([day, stats]) => {
      // Only include trading days that have actual trades
      return tradingDays.includes(day) && stats.TRADES > 0
    })
    .sort((a, b) => {
      const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      return dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0])
    })

  if (filteredDayStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Día de la Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No hay datos de trading disponibles</p>
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

  const getWinrateColor = (winrate: number) => {
    if (winrate >= 60) return "text-green-600 dark:text-green-400"
    if (winrate >= 50) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  const maxTrades = Math.max(...filteredDayStats.map(([, stats]) => stats.TRADES))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Rendimiento por Día de la Semana
          <Badge variant="secondary" className="text-xs">
            Solo días de trading
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Día</TableHead>
              <TableHead className="text-center">Operaciones</TableHead>
              <TableHead className="text-center">Ganadas</TableHead>
              <TableHead className="text-center">Perdidas</TableHead>
              <TableHead className="text-center">Winrate</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">P&L Promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDayStats.map(([day, stats]) => (
              <TableRow key={day} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {day}
                    <div className="w-16">
                      <Progress value={(stats.TRADES / maxTrades) * 100} className="h-1" />
                    </div>
                  </div>
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
            ))}
          </TableBody>
        </Table>

        {filteredDayStats.length < 5 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Solo se muestran los días de la semana con operaciones registradas. Los fines de semana se excluyen
              automáticamente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
