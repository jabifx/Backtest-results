import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Percent, BarChart3, Calendar, TrendingUp } from "lucide-react"
import type { Trade } from "@/lib/types"

interface StatsHighlightsProps {
  balance: number
  profit: number
  profitPercentage: number
  winrate: number
  initialBalance: number
  operations: number
  trades?: Trade[]
  // Añadir estas props para pasar los datos correctos
  monthlyStats?: Record<string, Record<string, number>>
  startDate?: string
  endDate?: string
}

export function StatsHighlights({
                                  balance,
                                  profit,
                                  profitPercentage,
                                  winrate,
                                  initialBalance,
                                  operations,
                                  trades = [],
                                  monthlyStats = {},
                                  startDate,
                                  endDate,
                                }: StatsHighlightsProps) {
  const isProfit = profit >= 0

  // Calcular rentabilidad mensual SIMPLE
  const calculateMonthlyProfitPercentage = () => {
    if (!monthlyStats || Object.keys(monthlyStats).length === 0) {
      return 0
    }

    // Contar total de meses
    let totalMonths = 0
    Object.values(monthlyStats).forEach(yearData => {
      totalMonths += Object.keys(yearData).length
    })

    if (totalMonths === 0) return 0

    // Rentabilidad total dividida entre meses
    const totalProfitPercentage = (profit / initialBalance) * 100
    return totalProfitPercentage / totalMonths
  }

  // Método alternativo más simple
  const calculateSimpleMonthlyProfitPercentage = () => {
    if (!monthlyStats || Object.keys(monthlyStats).length === 0) {
      return 0
    }

    // Contar total de meses
    let totalMonths = 0
    Object.values(monthlyStats).forEach(yearData => {
      totalMonths += Object.keys(yearData).length
    })

    if (totalMonths === 0) return 0

    // Rentabilidad total dividida entre meses
    const totalProfitPercentage = (profit / initialBalance) * 100
    return totalProfitPercentage / totalMonths
  }

  // Calcular rentabilidad anual proyectada
  const calculateYearlyProfitPercentage = () => {
    if (!startDate || !endDate) {
      // Si no hay fechas, usar el profit total como anual
      return (profit / initialBalance) * 100
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const yearsDiff = daysDiff / 365

    if (yearsDiff <= 0) return 0

    // Rentabilidad total dividida entre años
    const totalProfitPercentage = (profit / initialBalance) * 100
    return totalProfitPercentage / yearsDiff
  }

  // Calcular rentabilidad mensual alternativa si no hay monthly_stats
  const calculateSimpleMonthlyReturn = () => {
    if (!startDate || !endDate) {
      // Estimación simple dividiendo entre 12 meses
      const totalProfitPercentage = (profit / initialBalance) * 100
      return totalProfitPercentage / 12
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const monthsDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))

    if (monthsDiff <= 0) return 0

    // Rentabilidad total dividida entre meses
    const totalProfitPercentage = (profit / initialBalance) * 100
    return totalProfitPercentage / monthsDiff
  }

  // Usar monthly_stats si está disponible, sino usar cálculo simple
  const monthlyProfitPercentage = Object.keys(monthlyStats).length > 0
      ? calculateMonthlyProfitPercentage()
      : calculateSimpleMonthlyReturn()

  const yearlyProfitPercentage = calculateYearlyProfitPercentage()

  return (
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Balance */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Balance Actual</div>
              <div className="text-3xl font-bold">€{balance.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Inicial: €{initialBalance.toLocaleString()}</div>
            </div>

            {/* Profit */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Ganancia / Pérdida</div>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${isProfit ? "text-green-500" : "text-red-500"}`}>
                  €{profit.toLocaleString()}
                </div>
                <div className={`flex items-center text-sm ${isProfit ? "text-green-500" : "text-red-500"}`}>
                  {isProfit ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                  {profitPercentage.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Winrate */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Winrate</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{winrate.toFixed(2)}</div>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Operations */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Operaciones</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{operations}</div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Monthly Profit */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Rentabilidad Mensual (Promedio)
              </div>
              <div className="flex items-center">
                <div className={`text-2xl font-bold ${monthlyProfitPercentage >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {monthlyProfitPercentage >= 0 ? "+" : ""}
                  {monthlyProfitPercentage.toFixed(2)}%
                </div>
                <div className={`ml-2 ${monthlyProfitPercentage >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {monthlyProfitPercentage >= 0 ? (
                      <ArrowUpRight className="h-5 w-5" />
                  ) : (
                      <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Yearly Profit */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Rentabilidad Anual (Proyectada)
              </div>
              <div className="flex items-center">
                <div className={`text-2xl font-bold ${yearlyProfitPercentage >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {yearlyProfitPercentage >= 0 ? "+" : ""}
                  {yearlyProfitPercentage.toFixed(2)}%
                </div>
                <div className={`ml-2 ${yearlyProfitPercentage >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {yearlyProfitPercentage >= 0 ? (
                      <ArrowUpRight className="h-5 w-5" />
                  ) : (
                      <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}