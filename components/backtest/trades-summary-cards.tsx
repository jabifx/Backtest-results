"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Percent } from "lucide-react"
import type { Trade } from "@/lib/types"

interface TradesSummaryCardsProps {
  trades?: Trade[]
}

export function TradesSummaryCards({ trades = [] }: TradesSummaryCardsProps) {
  const totalTrades = trades.length
  const winningTrades = trades.filter((trade) => trade.RESULTADO === "TP").length
  const losingTrades = trades.filter((trade) => trade.RESULTADO === "SL").length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  const totalPL = trades.reduce((sum, trade) => sum + (trade["P&L"] ?? 0), 0)
  const avgWin =
    winningTrades > 0
      ? trades.filter((trade) => trade.RESULTADO === "TP").reduce((sum, trade) => sum + (trade["P&L"] ?? 0), 0) /
        winningTrades
      : 0
  const avgLoss =
    losingTrades > 0
      ? Math.abs(
          trades.filter((trade) => trade.RESULTADO === "SL").reduce((sum, trade) => sum + (trade["P&L"] ?? 0), 0),
        ) / losingTrades
      : 0

  const profitFactor = avgLoss > 0 ? (avgWin * winningTrades) / (avgLoss * losingTrades) : 0

  const formatCurrency = (value: number) => `€${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTrades}</div>
          <p className="text-xs text-muted-foreground">Operaciones ejecutadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Winrate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(winRate)}</div>
          <p className="text-xs text-muted-foreground">
            {winningTrades} ganadas de {totalTrades}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">P&L Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalPL >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(totalPL)}
          </div>
          <p className="text-xs text-muted-foreground">Beneficio total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(avgWin)}</div>
          <p className="text-xs text-muted-foreground">Por trade ganador</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pérdida Promedio</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(avgLoss)}</div>
          <p className="text-xs text-muted-foreground">Por trade perdedor</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profitFactor.toFixed(2)}</div>
          <Badge variant={profitFactor >= 1.5 ? "default" : "secondary"} className="text-xs">
            {profitFactor >= 2 ? "Excelente" : profitFactor >= 1.5 ? "Bueno" : profitFactor >= 1 ? "Aceptable" : "Malo"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
