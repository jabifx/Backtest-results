import { notFound } from "next/navigation"
import { getBacktest } from "@/lib/backtest-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImprovedDailyPerformanceTable } from "@/components/backtest/improved-daily-performance-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Calendar, LineChart, PieChart } from "lucide-react"
import { WinrateHeatmap } from "@/components/backtest/winrate-heatmap"
import { ConsecutiveResultsAnalysis } from "@/components/backtest/consecutive-results-analysis"

// Importar el componente real
import { DailyPerformanceChart } from "@/components/backtest/daily-performance-chart"

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  try {
    const backtest = await getBacktest(params.id)

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Análisis Detallado</h1>

        {/* Tabs para organizar el análisis */}
        <Tabs defaultValue="time" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Análisis Temporal
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Distribución
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Patrones
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Análisis Temporal */}
          <TabsContent value="time" className="space-y-6">
            {/* Mapa de calor de Winrate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Mapa de Calor de Winrate</CardTitle>
                <CardDescription>Visualización del winrate por día y hora</CardDescription>
              </CardHeader>
              <CardContent>
                <WinrateHeatmap
                  trades={backtest.trades.map((trade) => ({
                    ...trade,
                    DAY_OF_WEEK: new Date(trade.HORA).toLocaleDateString("en-US", { weekday: "long" }),
                    HOUR_OF_DAY: new Date(trade.HORA).getHours(),
                  }))}
                />
              </CardContent>
            </Card>

            {/* Rendimiento por Día */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Rendimiento por Día de la Semana</CardTitle>
                <CardDescription>Análisis detallado del rendimiento por día</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="table" className="w-full">
                  <div className="flex justify-center mb-4">
                    <TabsList>
                      <TabsTrigger value="table">Tabla</TabsTrigger>
                      <TabsTrigger value="chart">Gráfico</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="table">
                    <ImprovedDailyPerformanceTable dayStats={backtest.day_stats} />
                  </TabsContent>
                  <TabsContent value="chart">
                    <div className="h-[350px]">
                      <DailyPerformanceChart dayStats={backtest.day_stats} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Rendimiento por Hora */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Rendimiento por Hora del Día</CardTitle>
                <CardDescription>Análisis detallado del rendimiento por hora</CardDescription>
              </CardHeader>
              <CardContent>
                <KillzonesAnalysis
                  trades={backtest.trades.map((trade) => ({
                    ...trade,
                    HOUR_OF_DAY: new Date(trade.HORA).getHours(),
                  }))}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Distribución */}
          <TabsContent value="distribution" className="space-y-6">
            {/* Distribución de Ganancias */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Distribución de Ganancias</CardTitle>
                <CardDescription>Histograma de distribución de P&L por operación</CardDescription>
              </CardHeader>
              <CardContent>
                {backtest.trades.length > 0 ? (
                  <div className="space-y-6">
                    {/* Histograma simplificado */}
                    <div className="h-[300px] border rounded-lg p-4">
                      <SimpleProfitDistribution trades={backtest.trades} />
                    </div>

                    {/* Estadísticas de resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-3">Estadísticas de P&L</h3>
                        <ProfitStatsSummary trades={backtest.trades} />
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-3">Distribución por Resultado</h3>
                        <ResultDistribution trades={backtest.trades} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">No hay datos disponibles para mostrar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribución por Tipo de Orden */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Distribución por Tipo de Orden</CardTitle>
                <CardDescription>Análisis de rendimiento por tipo de orden (compra/venta)</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <OrderTypeDistributionChart trades={backtest.trades} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Patrones */}
          <TabsContent value="patterns" className="space-y-6">
            {/* Análisis de Resultados Consecutivos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Análisis de Resultados Consecutivos</CardTitle>
                <CardDescription>Patrones de operaciones ganadoras y perdedoras consecutivas</CardDescription>
              </CardHeader>
              <CardContent>
                <ConsecutiveResultsAnalysis trades={backtest.trades} />
              </CardContent>
            </Card>

            {/* Análisis de Sesiones */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Análisis de Sesiones</CardTitle>
                <CardDescription>Rendimiento por sesión de trading (mañana, tarde, noche)</CardDescription>
              </CardHeader>
              <CardContent>
                <SessionAnalysisChart trades={backtest.trades} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

// Componente para el gráfico de distribución por tipo de orden
function OrderTypeDistributionChart({ trades }: { trades: any[] }) {
  // Calcular estadísticas por tipo de orden
  const buyTrades = trades.filter((trade) => trade.ORDEN === "BUY")
  const sellTrades = trades.filter((trade) => trade.ORDEN === "SELL")

  const buyWins = buyTrades.filter((trade) => trade.RESULTADO === "TP").length
  const buyLosses = buyTrades.filter((trade) => trade.RESULTADO === "SL").length
  const sellWins = sellTrades.filter((trade) => trade.RESULTADO === "TP").length
  const sellLosses = sellTrades.filter((trade) => trade.RESULTADO === "SL").length

  const buyWinrate = buyTrades.length > 0 ? (buyWins / buyTrades.length) * 100 : 0
  const sellWinrate = sellTrades.length > 0 ? (sellWins / sellTrades.length) * 100 : 0

  const buyPL = buyTrades.reduce((sum, trade) => sum + trade["P&L"], 0)
  const sellPL = sellTrades.reduce((sum, trade) => sum + trade["P&L"], 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-green-500" />
          <h3 className="font-medium text-lg">Operaciones de Compra (BUY)</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{buyTrades.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Winrate</div>
              <div className="text-2xl font-bold">{buyWinrate.toFixed(2)}%</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Ganadas</div>
              <div className="text-xl font-semibold text-green-500">{buyWins}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Perdidas</div>
              <div className="text-xl font-semibold text-red-500">{buyLosses}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">P&L Total</div>
            <div className={`text-xl font-semibold ${buyPL >= 0 ? "text-green-500" : "text-red-500"}`}>
              €{buyPL.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-red-500" />
          <h3 className="font-medium text-lg">Operaciones de Venta (SELL)</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{sellTrades.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Winrate</div>
              <div className="text-2xl font-bold">{sellWinrate.toFixed(2)}%</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Ganadas</div>
              <div className="text-xl font-semibold text-green-500">{sellWins}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Perdidas</div>
              <div className="text-xl font-semibold text-red-500">{sellLosses}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">P&L Total</div>
            <div className={`text-xl font-semibold ${sellPL >= 0 ? "text-green-500" : "text-red-500"}`}>
              €{sellPL.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para el análisis de sesiones
function SessionAnalysisChart({ trades }: { trades: any[] }) {
  // Definir las sesiones
  const sessions = {
    morning: { name: "Mañana (6:00-12:00)", hours: [6, 7, 8, 9, 10, 11] },
    afternoon: { name: "Tarde (12:00-18:00)", hours: [12, 13, 14, 15, 16, 17] },
    evening: { name: "Noche (18:00-24:00)", hours: [18, 19, 20, 21, 22, 23] },
  }

  // Calcular estadísticas por sesión
  const sessionStats = Object.entries(sessions).map(([key, session]) => {
    const sessionTrades = trades.filter((trade) => session.hours.includes(trade.HOUR_OF_DAY))

    const wins = sessionTrades.filter((trade) => trade.RESULTADO === "TP").length
    const losses = sessionTrades.filter((trade) => trade.RESULTADO === "SL").length
    const winrate = sessionTrades.length > 0 ? (wins / sessionTrades.length) * 100 : 0
    const pnl = sessionTrades.reduce((sum, trade) => sum + trade["P&L"], 0)
    const avgPnl = sessionTrades.length > 0 ? pnl / sessionTrades.length : 0

    return {
      name: session.name,
      trades: sessionTrades.length,
      wins,
      losses,
      winrate,
      pnl,
      avgPnl,
    }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sessionStats.map((session, index) => (
        <div key={index} className="border rounded-lg p-4 bg-muted/20">
          <h3 className="font-medium text-lg mb-3">{session.name}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Operaciones:</span>
              <span className="font-medium">{session.trades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Winrate:</span>
              <span className="font-medium">{session.winrate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">P&L Total:</span>
              <span className={`font-medium ${session.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                €{session.pnl.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">P&L Promedio:</span>
              <span className={`font-medium ${session.avgPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                €{session.avgPnl.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ganadas/Perdidas:</span>
              <span className="font-medium">
                <span className="text-green-500">{session.wins}</span> /
                <span className="text-red-500 ml-1">{session.losses}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente simplificado para mostrar la distribución de ganancias
function SimpleProfitDistribution({ trades }: { trades: any[] }) {
  // Extraer valores de P&L
  const pnlValues = trades.map((trade) => trade["P&L"])

  // Agrupar en rangos simples
  const ranges = [
    { min: Number.NEGATIVE_INFINITY, max: -100, label: "< -100€", color: "bg-red-800" },
    { min: -100, max: -50, label: "-100€ a -50€", color: "bg-red-600" },
    { min: -50, max: -20, label: "-50€ a -20€", color: "bg-red-500" },
    { min: -20, max: 0, label: "-20€ a 0€", color: "bg-red-400" },
    { min: 0, max: 20, label: "0€ a 20€", color: "bg-green-400" },
    { min: 20, max: 50, label: "20€ a 50€", color: "bg-green-500" },
    { min: 50, max: 100, label: "50€ a 100€", color: "bg-green-600" },
    { min: 100, max: Number.POSITIVE_INFINITY, label: "> 100€", color: "bg-green-800" },
  ]

  // Contar operaciones en cada rango
  const counts = ranges.map((range) => ({
    ...range,
    count: pnlValues.filter((val) => val > range.min && val <= range.max).length,
    percentage: (pnlValues.filter((val) => val > range.min && val <= range.max).length / pnlValues.length) * 100,
  }))

  // Encontrar el máximo para escalar las barras
  const maxCount = Math.max(...counts.map((item) => item.count))

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-2">Distribución de P&L por Rango</div>
      <div className="flex-1 flex items-end space-x-2">
        {counts.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full text-center text-xs mb-1">{item.count}</div>
            <div
              className={`w-full ${item.color} rounded-t-sm`}
              style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: item.count > 0 ? "8px" : "0" }}
            ></div>
            <div className="w-full text-center text-xs mt-1 truncate" title={item.label}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente para mostrar estadísticas de P&L
function ProfitStatsSummary({ trades }: { trades: any[] }) {
  // Extraer valores de P&L
  const pnlValues = trades.map((trade) => trade["P&L"])

  // Calcular estadísticas
  const totalPnL = pnlValues.reduce((sum, val) => sum + val, 0)
  const avgPnL = totalPnL / pnlValues.length
  const maxPnL = Math.max(...pnlValues)
  const minPnL = Math.min(...pnlValues)

  // Calcular desviación estándar
  const variance = pnlValues.reduce((sum, val) => sum + Math.pow(val - avgPnL, 2), 0) / pnlValues.length
  const stdDev = Math.sqrt(variance)

  // Estadísticas a mostrar
  const stats = [
    { label: "P&L Total", value: `€${totalPnL.toFixed(2)}`, isPositive: totalPnL >= 0 },
    { label: "P&L Promedio", value: `€${avgPnL.toFixed(2)}`, isPositive: avgPnL >= 0 },
    { label: "P&L Máximo", value: `€${maxPnL.toFixed(2)}`, isPositive: true },
    { label: "P&L Mínimo", value: `€${minPnL.toFixed(2)}`, isPositive: false },
    { label: "Desviación Estándar", value: `€${stdDev.toFixed(2)}`, isPositive: null },
  ]

  return (
    <div className="space-y-2">
      {stats.map((stat, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{stat.label}:</span>
          <span
            className={`font-medium ${
              stat.isPositive === null ? "" : stat.isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// Componente para mostrar distribución por resultado
function ResultDistribution({ trades }: { trades: any[] }) {
  // Contar operaciones por resultado
  const tpTrades = trades.filter((trade) => trade.RESULTADO === "TP")
  const slTrades = trades.filter((trade) => trade.RESULTADO === "SL")

  // Calcular porcentajes
  const tpPercentage = (tpTrades.length / trades.length) * 100
  const slPercentage = (slTrades.length / trades.length) * 100

  // Calcular P&L por tipo
  const tpPnL = tpTrades.reduce((sum, trade) => sum + trade["P&L"], 0)
  const slPnL = slTrades.reduce((sum, trade) => sum + trade["P&L"], 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Take Profit</div>
          <div className="text-2xl font-bold text-green-500">{tpTrades.length}</div>
          <div className="text-xs text-muted-foreground">{tpPercentage.toFixed(1)}%</div>
          <div className="text-sm text-green-500 mt-1">€{tpPnL.toFixed(2)}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Stop Loss</div>
          <div className="text-2xl font-bold text-red-500">{slTrades.length}</div>
          <div className="text-xs text-muted-foreground">{slPercentage.toFixed(1)}%</div>
          <div className="text-sm text-red-500 mt-1">€{slPnL.toFixed(2)}</div>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-500" style={{ width: `${tpPercentage}%` }}></div>
      </div>
    </div>
  )
}

// Componente para análisis de killzones
function KillzonesAnalysis({ trades }: { trades: any[] }) {
  // Definir las killzones (horarios en UTC)
  const killzones = {
    asia: {
      name: "Asia",
      hours: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      color: "bg-blue-500",
      description: "00:00 - 08:00 UTC",
    },
    london: {
      name: "London",
      hours: [8, 9, 10, 11, 12, 13, 14, 15],
      color: "bg-green-500",
      description: "08:00 - 16:00 UTC",
    },
    newyork: {
      name: "New York",
      hours: [13, 14, 15, 16, 17, 18, 19, 20, 21],
      color: "bg-orange-500",
      description: "13:00 - 21:00 UTC",
    },
  }

  // Calcular estadísticas por killzone
  const killzoneStats = Object.entries(killzones).map(([key, zone]) => {
    const zoneTrades = trades.filter((trade) => zone.hours.includes(trade.HOUR_OF_DAY))

    const wins = zoneTrades.filter((trade) => trade.RESULTADO === "TP").length
    const losses = zoneTrades.filter((trade) => trade.RESULTADO === "SL").length
    const winrate = zoneTrades.length > 0 ? (wins / zoneTrades.length) * 100 : 0
    const pnl = zoneTrades.reduce((sum, trade) => sum + trade["P&L"], 0)
    const avgPnl = zoneTrades.length > 0 ? pnl / zoneTrades.length : 0

    return {
      name: zone.name,
      description: zone.description,
      color: zone.color,
      trades: zoneTrades.length,
      wins,
      losses,
      winrate,
      pnl,
      avgPnl,
    }
  })

  // Encontrar la mejor killzone
  const bestKillzone = killzoneStats.reduce((best, current) => (current.winrate > best.winrate ? current : best))

  return (
    <div className="space-y-6">
      {/* Resumen de killzones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {killzoneStats.map((zone, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 relative overflow-hidden ${zone.name === bestKillzone.name ? "ring-2 ring-primary" : ""}`}
          >
            {/* Indicador de color */}
            <div className={`absolute top-0 left-0 w-1 h-full ${zone.color}`}></div>

            {/* Badge de mejor killzone */}
            {zone.name === bestKillzone.name && (
              <div className="absolute top-2 right-2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Mejor</span>
              </div>
            )}

            <div className="ml-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{zone.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{zone.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Operaciones:</span>
                  <span className="font-medium">{zone.trades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Winrate:</span>
                  <span className="font-medium">{zone.winrate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P&L Total:</span>
                  <span className={`font-medium ${zone.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    €{zone.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P&L Promedio:</span>
                  <span className={`font-medium ${zone.avgPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    €{zone.avgPnl.toFixed(2)}
                  </span>
                </div>

                {/* Barra de winrate */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Ganadas: {zone.wins}</span>
                    <span>Perdidas: {zone.losses}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${zone.winrate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico comparativo */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-lg mb-4">Comparación de Killzones</h3>
        <div className="space-y-4">
          {/* Winrate comparison */}
          <div>
            <div className="text-sm font-medium mb-2">Winrate por Killzone</div>
            <div className="space-y-2">
              {killzoneStats.map((zone, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${zone.color}`}></div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm w-16">{zone.name}</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${zone.color} transition-all duration-500`}
                        style={{ width: `${zone.winrate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{zone.winrate.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trades volume comparison */}
          <div>
            <div className="text-sm font-medium mb-2">Volumen de Operaciones</div>
            <div className="space-y-2">
              {killzoneStats.map((zone, index) => {
                const maxTrades = Math.max(...killzoneStats.map((z) => z.trades))
                const percentage = maxTrades > 0 ? (zone.trades / maxTrades) * 100 : 0

                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${zone.color}`}></div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm w-16">{zone.name}</span>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${zone.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{zone.trades}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <h3 className="font-medium text-lg mb-3">Insights de Killzones</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Mejor killzone:</strong> {bestKillzone.name} con {bestKillzone.winrate.toFixed(1)}% de winrate
          </p>
          <p>
            <strong>Total de operaciones:</strong> {killzoneStats.reduce((sum, zone) => sum + zone.trades, 0)}
            distribuidas entre las 3 killzones principales
          </p>
          <p>
            <strong>Killzone más activa:</strong>{" "}
            {killzoneStats.reduce((max, zone) => (zone.trades > max.trades ? zone : max)).name}
            con {killzoneStats.reduce((max, zone) => (zone.trades > max.trades ? zone : max)).trades} operaciones
          </p>
        </div>
      </div>
    </div>
  )
}
