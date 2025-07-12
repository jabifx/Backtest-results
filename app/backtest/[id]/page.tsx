import { notFound } from "next/navigation"
import { getBacktest } from "@/lib/backtest-service"
import { PerformanceChart } from "@/components/backtest/performance-chart"
import { StatsHighlights } from "@/components/backtest/stats-highlights"
import { ConfigSummary } from "@/components/backtest/config-summary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyProfitabilityTable } from "@/components/backtest/monthly-profitability-table"
import { TrendingUp, BarChart3, Calendar, AlertTriangle } from "lucide-react"
import { StrategyHealthCard as StrategyHealthCardComponent } from "@/components/backtest/strategy-health-card"

export default async function DashboardPage({ params }: { params: { id: string } }) {
  try {
    const backtest = await getBacktest(params.id)

    // Verificar que backtest.trades existe y tiene datos
    console.log("Trades disponibles:", backtest.trades?.length || 0)

    // Calculate total profit percentage
    const profitPercentage = ((backtest.stats["P&L"] / backtest.stats["BALANCE INICIAL"]) * 100).toFixed(2)

    // Calculate best and worst days
    const dayStats = Object.entries(backtest.day_stats)
    const bestDay = dayStats.reduce(
      (best, [day, stats]) => (!best || stats["P&L"] > best.stats["P&L"] ? { day, stats } : best),
      null,
    )
    const worstDay = dayStats.reduce(
      (worst, [day, stats]) => (!worst || stats["P&L"] < worst.stats["P&L"] ? { day, stats } : worst),
      null,
    )

    // Calculate best and worst hours
    const hourStats = Object.entries(backtest.hour_stats)
    const bestHour = hourStats.reduce(
      (best, [hour, stats]) => (!best || stats["P&L"] > best.stats["P&L"] ? { hour, stats } : best),
      null,
    )
    const worstHour = hourStats.reduce(
      (worst, [hour, stats]) => (!worst || stats["P&L"] < worst.stats["P&L"] ? { hour, stats } : worst),
      null,
    )

    // Función para calcular la variabilidad mensual (coeficiente de variación)
    const calculateMonthlyVariability = (monthlyStats: any): number => {
      // Extraer todos los valores mensuales
      const allMonthlyValues: number[] = []
      Object.keys(monthlyStats).forEach((year) => {
        Object.keys(monthlyStats[year]).forEach((month) => {
          allMonthlyValues.push(monthlyStats[year][month])
        })
      })

      // Calcular media y desviación estándar
      const mean = allMonthlyValues.reduce((sum, val) => sum + val, 0) / allMonthlyValues.length
      const variance = allMonthlyValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allMonthlyValues.length
      const stdDev = Math.sqrt(variance)

      // Coeficiente de variación (en porcentaje)
      return (stdDev / Math.abs(mean)) * 100
    }

    // Función para calcular el ratio de consistencia (días con resultados similares)
    const calculateConsistencyRatio = (trades: any[]): number => {
      if (trades.length < 2) return 0

      // Agrupar operaciones por día
      const tradesByDay: Record<string, any[]> = {}
      trades.forEach((trade) => {
        const date = new Date(trade.HORA).toISOString().split("T")[0]
        if (!tradesByDay[date]) tradesByDay[date] = []
        tradesByDay[date].push(trade)
      })

      // Contar días con resultados consistentes (todos ganados o todos perdidos)
      let consistentDays = 0
      Object.values(tradesByDay).forEach((dayTrades) => {
        if (dayTrades.length > 1) {
          const allWins = dayTrades.every((trade) => trade.RESULTADO === "TP")
          const allLosses = dayTrades.every((trade) => trade.RESULTADO === "SL")
          if (allWins || allLosses) consistentDays++
        }
      })

      return consistentDays / Object.keys(tradesByDay).length
    }

    // Función para calcular el porcentaje de secuencias específicas
    const calculateSequencePercentage = (trades: any[], sequence: string[]): number => {
      if (trades.length <= sequence.length) return 0

      let sequenceCount = 0
      for (let i = 0; i <= trades.length - sequence.length; i++) {
        let match = true
        for (let j = 0; j < sequence.length; j++) {
          if (trades[i + j].RESULTADO !== sequence[j]) {
            match = false
            break
          }
        }
        if (match) sequenceCount++
      }

      return (sequenceCount / (trades.length - sequence.length + 1)) * 100
    }

    // Función para calcular el efecto momentum
    const calculateMomentumEffect = (trades: any[]): number => {
      if (trades.length < 3) return 0

      let continuationCount = 0
      let reversalCount = 0

      for (let i = 2; i < trades.length; i++) {
        const pattern = trades[i - 2].RESULTADO + trades[i - 1].RESULTADO
        const currentResult = trades[i].RESULTADO

        if ((pattern === "TPTP" && currentResult === "TP") || (pattern === "SLSL" && currentResult === "SL")) {
          continuationCount++
        } else if ((pattern === "TPTP" && currentResult === "SL") || (pattern === "SLSL" && currentResult === "TP")) {
          reversalCount++
        }
      }

      const total = continuationCount + reversalCount
      if (total === 0) return 0

      return (continuationCount - reversalCount) / total
    }

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

        {/* Config Summary */}
        <ConfigSummary
          symbol={backtest.config.SYMBOL}
          strategy={backtest.config.STRATEGY}
          startDate={backtest.config.INICIO}
          endDate={backtest.config.FIN}
          initialBalance={backtest.config.BALANCE}
          risk={backtest.strategy_config.RIESGO}
          riskReward={backtest.strategy_config.RR}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Primera fila: Gráfico y Estadísticas */}
          <div className="lg:col-span-9 grid grid-rows-[320px_auto] gap-4">
            {/* Performance Chart */}
            <Card className="shadow-md flex flex-col">
              <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-base">Evolución del Capital</CardTitle>
                <CardDescription className="text-xs">Seguimiento del balance a lo largo del tiempo</CardDescription>
              </CardHeader>
              <CardContent className="p-2 flex-1 overflow-hidden">
                          <PerformanceChart
            trades={backtest.trades}
            initialBalance={5000}
            commission={2}
          />
              </CardContent>
            </Card>

            {/* Detalles de Configuración de Estrategia */}
            <Card className="shadow-md">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Configuración de Estrategia
                </CardTitle>
                <CardDescription>Parámetros clave que definen el comportamiento de la estrategia</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {/* Información General de la Estrategia */}
                <div className="mb-6 border rounded-md p-4 bg-muted/10">
                  <h3 className="text-sm font-medium text-primary mb-3 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1 text-primary" /> Información General
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground">Nombre de la Estrategia</div>
                        <div className="text-base font-semibold">{backtest.config.STRATEGY}</div>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground">Tipo</div>
                        <div className="text-sm">{backtest.strategy_config.TIPO || "No especificado"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Activo Principal</div>
                        <div className="text-sm">{backtest.config.SYMBOL}</div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground">Descripción</div>
                        <div className="text-sm">
                          {backtest.strategy_config.DESCRIPCION || "Sin descripción disponible"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Activos Recomendados</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md">
                            {backtest.config.SYMBOL}
                          </span>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md">
                            DAX
                          </span>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md">
                            S&P 500
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Parámetros de Trading */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-primary" /> Horarios y Calendario
                    </h3>
                    <div className="space-y-3">
                      {/* Horarios de Trading */}
                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-2">Horarios de Trading</div>
                        <div className="space-y-1">
                          {backtest.strategy_config["TRADING HOURS"].map((hours, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                              <span className="text-sm">
                                {hours[0]} - {hours[1]}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Última operación permitida: {backtest.strategy_config["LAST TRADE"]}:00
                        </div>
                      </div>

                      {/* Días Excluidos */}
                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-2">Días Excluidos</div>
                        {backtest.strategy_config["EXCLUDED DAYS"].length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {backtest.strategy_config["EXCLUDED DAYS"].map((day, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-muted rounded-md">
                                {day}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm">No hay días excluidos</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Parámetros de Riesgo y Timeframes */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-primary" /> Riesgo y Análisis
                    </h3>
                    <div className="space-y-3">
                      {/* Gestión de Riesgo */}
                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-2">Gestión de Riesgo</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/30 rounded p-2">
                            <div className="text-xs text-muted-foreground">Riesgo por Operación</div>
                            <div className="text-lg font-semibold">
                              {(backtest.strategy_config.RIESGO * 100).toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded p-2">
                            <div className="text-xs text-muted-foreground">Ratio Riesgo/Beneficio</div>
                            <div className="text-lg font-semibold">{backtest.strategy_config.RR}:1</div>
                          </div>
                        </div>
                      </div>

                      {/* Timeframes */}
                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-2">Timeframes Analizados</div>
                        <div className="flex flex-wrap gap-2">
                          {backtest.strategy_config.TFs.map((tf, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md"
                            >
                              {tf}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Velas analizadas: {backtest.config.VELAS}
                        </div>
                      </div>

                      {/* Costes */}
                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-2">Costes de Trading</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/30 rounded p-2">
                            <div className="text-xs text-muted-foreground">Spread</div>
                            <div className="text-lg font-semibold">{backtest.config.SPREAD}</div>
                          </div>
                          <div className="bg-muted/30 rounded p-2">
                            <div className="text-xs text-muted-foreground">Comisión</div>
                            <div className="text-lg font-semibold">€{backtest.config.COMISSION}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Highlights - Spans 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            <StatsHighlights
              balance={backtest.stats["BALANCE"]}
              profit={backtest.stats["P&L"]}
              profitPercentage={Number.parseFloat(profitPercentage)}
              winrate={backtest.stats["WINRATE"]}
              initialBalance={backtest.stats["BALANCE INICIAL"]}
              operations={backtest.stats["OPERACIONES"]}
              trades={backtest.trades} // Asegurarse de que se pasa correctamente
            />

            {/* Strategy Health */}
            <StrategyHealthCardComponent stats={backtest.stats} />
          </div>
        </div>

        {/* Nueva sección: Insights de Trading */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Insights de Trading</CardTitle>
            <CardDescription>Análisis de patrones y momentos óptimos para operar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mejor día para operar */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Mejor día para operar</h3>
                </div>
                <div className="text-2xl font-bold">{bestDay?.day}</div>
                <div className="text-sm text-muted-foreground mt-1">Winrate: {bestDay?.stats.WINRATE.toFixed(2)}%</div>
                <div className="text-sm text-green-500 font-medium mt-1">P&L: €{bestDay?.stats["P&L"].toFixed(2)}</div>
              </div>

              {/* Peor día para operar */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-medium">Día a evitar</h3>
                </div>
                <div className="text-2xl font-bold">{worstDay?.day}</div>
                <div className="text-sm text-muted-foreground mt-1">Winrate: {worstDay?.stats.WINRATE.toFixed(2)}%</div>
                <div className="text-sm text-red-500 font-medium mt-1">P&L: €{worstDay?.stats["P&L"].toFixed(2)}</div>
              </div>

              {/* Mejor hora para operar */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Mejor hora para operar</h3>
                </div>
                <div className="text-2xl font-bold">{bestHour?.hour}:00</div>
                <div className="text-sm text-muted-foreground mt-1">Winrate: {bestHour?.stats.WINRATE.toFixed(2)}%</div>
                <div className="text-sm text-green-500 font-medium mt-1">P&L: €{bestHour?.stats["P&L"].toFixed(2)}</div>
              </div>

              {/* Peor hora para operar */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-red-500" />
                  <h3 className="font-medium">Hora a evitar</h3>
                </div>
                <div className="text-2xl font-bold">{worstHour?.hour}:00</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Winrate: {worstHour?.stats.WINRATE.toFixed(2)}%
                </div>
                <div className="text-sm text-red-500 font-medium mt-1">P&L: €{worstHour?.stats["P&L"].toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Profitability Table */}
        <MonthlyProfitabilityTable monthlyStats={backtest.monthly_stats} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
