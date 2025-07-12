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
}

export function StatsHighlights({
  balance,
  profit,
  profitPercentage,
  winrate,
  initialBalance,
  operations,
  trades = [],
}: StatsHighlightsProps) {
  const isProfit = profit >= 0

  // Calcular rentabilidad mensual simple (sin calcular desde trades)
  const calculateMonthlyProfitPercentage = () => {
    // Estimación simple: dividir el profit total por 8 meses
    const estimatedMonths = 8
    const totalProfitPercentage = (profit / initialBalance) * 100
    return totalProfitPercentage / estimatedMonths
  }

  // Calcular rentabilidad anual simple (sin calcular desde trades)
  const calculateYearlyProfitPercentage = () => {
    // Estimación simple: usar el profit total como anual
    return (profit / initialBalance) * 100
  }

  // Calcular los valores usando estimaciones simples
  const monthlyProfitPercentage = calculateMonthlyProfitPercentage()
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
                {profitPercentage}%
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
              Rentabilidad Anual (Promedio)
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
