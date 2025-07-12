"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Trade } from "@/lib/types"

// Register Chart.js components
Chart.register(...registerables)

interface ConsecutiveResultsAnalysisProps {
  trades: Trade[]
}

export function ConsecutiveResultsAnalysis({ trades }: ConsecutiveResultsAnalysisProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Analizar secuencias de resultados
  const analyzeSequences = () => {
    if (trades.length === 0) return { sequences: [], stats: {} }

    // Ordenar operaciones por fecha
    const sortedTrades = [...trades].sort((a, b) => new Date(a.HORA).getTime() - new Date(b.HORA).getTime())

    // Extraer secuencia de resultados
    const results = sortedTrades.map((trade) => trade.RESULTADO)

    // Contar secuencias
    const sequences: Record<string, number> = {
      "TP-TP": 0,
      "TP-SL": 0,
      "SL-TP": 0,
      "SL-SL": 0,
      "TP-TP-TP": 0,
      "TP-TP-SL": 0,
      "TP-SL-TP": 0,
      "TP-SL-SL": 0,
      "SL-TP-TP": 0,
      "SL-TP-SL": 0,
      "SL-SL-TP": 0,
      "SL-SL-SL": 0,
    }

    // Contar secuencias de 2
    for (let i = 0; i < results.length - 1; i++) {
      const seq = `${results[i]}-${results[i + 1]}`
      if (sequences[seq] !== undefined) {
        sequences[seq]++
      }
    }

    // Contar secuencias de 3
    for (let i = 0; i < results.length - 2; i++) {
      const seq = `${results[i]}-${results[i + 1]}-${results[i + 2]}`
      if (sequences[seq] !== undefined) {
        sequences[seq]++
      }
    }

    // Calcular estadísticas adicionales
    const stats = {
      // Probabilidad de ganar después de ganar
      winAfterWin: (sequences["TP-TP"] / (sequences["TP-TP"] + sequences["TP-SL"] || 1)) * 100,

      // Probabilidad de ganar después de perder
      winAfterLoss: (sequences["SL-TP"] / (sequences["SL-TP"] + sequences["SL-SL"] || 1)) * 100,

      // Probabilidad de perder después de ganar
      lossAfterWin: (sequences["TP-SL"] / (sequences["TP-TP"] + sequences["TP-SL"] || 1)) * 100,

      // Probabilidad de perder después de perder
      lossAfterLoss: (sequences["SL-SL"] / (sequences["SL-TP"] + sequences["SL-SL"] || 1)) * 100,

      // Secuencia más común de 2
      mostCommonSeq2: Object.entries(sequences)
        .filter(([key]) => key.split("-").length === 2)
        .sort((a, b) => b[1] - a[1])[0],

      // Secuencia más común de 3
      mostCommonSeq3: Object.entries(sequences)
        .filter(([key]) => key.split("-").length === 3)
        .sort((a, b) => b[1] - a[1])[0],
    }

    return { sequences, stats }
  }

  const { sequences, stats } = analyzeSequences()

  // Crear gráfico de probabilidades condicionales
  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico existente si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const { sequences } = analyzeSequences()

    // Datos para el gráfico
    const labels = ["Después de Ganar", "Después de Perder"]
    const winData = [
      (sequences["TP-TP"] / (sequences["TP-TP"] + sequences["TP-SL"] || 1)) * 100,
      (sequences["SL-TP"] / (sequences["SL-TP"] + sequences["SL-SL"] || 1)) * 100,
    ]
    const lossData = [
      (sequences["TP-SL"] / (sequences["TP-TP"] + sequences["TP-SL"] || 1)) * 100,
      (sequences["SL-SL"] / (sequences["SL-TP"] + sequences["SL-SL"] || 1)) * 100,
    ]

    // Crear el gráfico
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Probabilidad de Ganar",
            data: winData,
            backgroundColor: "rgba(34, 197, 94, 0.7)",
            borderColor: "rgb(34, 197, 94)",
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: "Probabilidad de Perder",
            data: lossData,
            backgroundColor: "rgba(239, 68, 68, 0.7)",
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Probabilidad (%)",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)}%`,
            },
          },
        },
      },
    })

    // Función de limpieza
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [trades])

  const { stats: calculatedStats } = analyzeSequences()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Probabilidades Condicionales</h3>
            <div className="h-[250px]">
              <canvas ref={chartRef} aria-label="Probabilidades Condicionales"></canvas>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Patrones Identificados</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Secuencia más común (2 operaciones):</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {calculatedStats.mostCommonSeq2?.[0].replace(/-/g, " → ")}
                  </Badge>
                  <span className="text-sm">{calculatedStats.mostCommonSeq2?.[1]} veces</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Secuencia más común (3 operaciones):</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {calculatedStats.mostCommonSeq3?.[0].replace(/-/g, " → ")}
                  </Badge>
                  <span className="text-sm">{calculatedStats.mostCommonSeq3?.[1]} veces</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-sm text-muted-foreground mb-2">Probabilidades:</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ganar después de ganar:</span>
                    <Badge variant={calculatedStats.winAfterWin > 50 ? "default" : "destructive"}>
                      {calculatedStats.winAfterWin.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ganar después de perder:</span>
                    <Badge variant={calculatedStats.winAfterLoss > 50 ? "default" : "destructive"}>
                      {calculatedStats.winAfterLoss.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Perder después de ganar:</span>
                    <Badge variant={calculatedStats.lossAfterWin < 50 ? "default" : "destructive"}>
                      {calculatedStats.lossAfterWin.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Perder después de perder:</span>
                    <Badge variant={calculatedStats.lossAfterLoss < 50 ? "default" : "destructive"}>
                      {calculatedStats.lossAfterLoss.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 border">
        <h3 className="text-lg font-medium mb-2">Recomendaciones basadas en patrones</h3>
        <ul className="space-y-2 text-sm">
          {calculatedStats.winAfterWin > calculatedStats.winAfterLoss ? (
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>
                Considera mantener posiciones después de operaciones ganadoras, ya que hay una mayor probabilidad de
                éxito.
              </span>
            </li>
          ) : (
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>
                Considera entrar después de operaciones perdedoras, ya que hay una mayor probabilidad de éxito.
              </span>
            </li>
          )}

          {calculatedStats.lossAfterLoss > 50 && (
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>
                Evita operar después de dos pérdidas consecutivas, ya que hay una alta probabilidad de continuar
                perdiendo.
              </span>
            </li>
          )}

          {calculatedStats.winAfterWin > 60 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Considera aumentar el tamaño de posición después de una operación ganadora.</span>
            </li>
          )}

          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>
              La secuencia más común es {calculatedStats.mostCommonSeq2?.[0].replace(/-/g, " → ")}. Considera adaptar tu
              estrategia para aprovechar este patrón.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
