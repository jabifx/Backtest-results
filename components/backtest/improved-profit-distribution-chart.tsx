"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Trade } from "@/lib/types"

// Register Chart.js components
Chart.register(...registerables)

interface ImprovedProfitDistributionChartProps {
  trades: Trade[]
}

export function ImprovedProfitDistributionChart({ trades }: ImprovedProfitDistributionChartProps) {
  const [viewMode, setViewMode] = useState<"histogram" | "summary">("histogram")

  // Asegurarse de que hay datos para mostrar
  useEffect(() => {
    if (trades.length === 0) {
      console.warn("No hay operaciones para mostrar en el gráfico de distribución")
    }
  }, [trades])

  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Calcular estadísticas de P&L
  const pnlValues = trades.map((trade) => trade["P&L"])
  const totalPnL = pnlValues.reduce((sum, val) => sum + val, 0)
  const avgPnL = totalPnL / pnlValues.length
  const maxPnL = Math.max(...pnlValues)
  const minPnL = Math.min(...pnlValues)

  // Calcular la desviación estándar
  const variance = pnlValues.reduce((sum, val) => sum + Math.pow(val - avgPnL, 2), 0) / pnlValues.length
  const stdDev = Math.sqrt(variance)

  // Calcular percentiles
  const sortedPnL = [...pnlValues].sort((a, b) => a - b)
  const getPercentile = (percentile: number) => {
    const index = Math.floor((percentile / 100) * sortedPnL.length)
    return sortedPnL[index]
  }

  const percentile25 = getPercentile(25)
  const percentile50 = getPercentile(50) // Mediana
  const percentile75 = getPercentile(75)

  // Crear el histograma
  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico existente si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Asegurarse de que hay datos para mostrar
    if (pnlValues.length === 0) {
      console.error("No hay datos de P&L para mostrar en el histograma")
      return
    }

    // Crear bins para el histograma
    const min = Math.min(...pnlValues)
    const max = Math.max(...pnlValues)
    const binCount = Math.min(15, pnlValues.length / 2) // Ajustar bins según cantidad de datos
    const binSize = (max - min) / binCount

    const bins = Array(binCount).fill(0)
    const binLabels = []

    // Crear etiquetas de bins
    for (let i = 0; i < binCount; i++) {
      const lowerBound = min + i * binSize
      const upperBound = min + (i + 1) * binSize
      binLabels.push(`${lowerBound.toFixed(0)}€ a ${upperBound.toFixed(0)}€`)
    }

    // Llenar los bins
    pnlValues.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1)
      bins[binIndex]++
    })

    // Crear el gráfico
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: binLabels,
        datasets: [
          {
            label: "Número de Operaciones",
            data: bins,
            backgroundColor: binLabels.map((_, i) => {
              const midValue = min + (i + 0.5) * binSize
              return midValue >= 0 ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)"
            }),
            borderColor: binLabels.map((_, i) => {
              const midValue = min + (i + 0.5) * binSize
              return midValue >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
            }),
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (context) => context[0].label,
              label: (context) => `Operaciones: ${context.raw}`,
            },
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "Número de Operaciones",
            },
            beginAtZero: true,
          },
          x: {
            title: {
              display: true,
              text: "Rango de P&L (€)",
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    })

    // Forzar una actualización del gráfico
    setTimeout(() => {
      if (chartInstance.current) {
        chartInstance.current.update()
      }
    }, 100)

    // Función de limpieza
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [pnlValues, viewMode])

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "histogram" | "summary")}
          className="w-[200px]"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="histogram">Histograma</TabsTrigger>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="histogram" className="mt-0">
        {pnlValues.length > 0 ? (
          <div className="h-[350px]">
            <canvas ref={chartRef} aria-label="Distribución de Ganancias"></canvas>
          </div>
        ) : (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">No hay datos suficientes para mostrar el histograma</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="summary" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Estadísticas Generales</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P&L Total:</span>
                  <span className={`font-medium ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                    €{totalPnL.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P&L Promedio:</span>
                  <span className={`font-medium ${avgPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                    €{avgPnL.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P&L Máximo:</span>
                  <span className="font-medium text-green-500">€{maxPnL.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P&L Mínimo:</span>
                  <span className="font-medium text-red-500">€{minPnL.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Desviación Estándar:</span>
                  <span className="font-medium">€{stdDev.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Distribución de P&L</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mediana (P50):</span>
                  <span className={`font-medium ${percentile50 >= 0 ? "text-green-500" : "text-red-500"}`}>
                    €{percentile50.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Percentil 25 (P25):</span>
                  <span className={`font-medium ${percentile25 >= 0 ? "text-green-500" : "text-red-500"}`}>
                    €{percentile25.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Percentil 75 (P75):</span>
                  <span className={`font-medium ${percentile75 >= 0 ? "text-green-500" : "text-red-500"}`}>
                    €{percentile75.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Operaciones Positivas:</span>
                  <span className="font-medium text-green-500">
                    {pnlValues.filter((val) => val > 0).length} (
                    {((pnlValues.filter((val) => val > 0).length / pnlValues.length) * 100).toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Operaciones Negativas:</span>
                  <span className="font-medium text-red-500">
                    {pnlValues.filter((val) => val < 0).length} (
                    {((pnlValues.filter((val) => val < 0).length / pnlValues.length) * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </div>
  )
}
