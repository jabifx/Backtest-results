"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { Trade } from "@/lib/types"

// Register Chart.js components
Chart.register(...registerables)

interface ProfitDistributionChartProps {
  trades: Trade[]
}

export function ProfitDistributionChart({ trades }: ProfitDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Extract P&L values
    const pnlValues = trades.map((trade) => trade["P&L"])

    // Create bins for histogram
    const min = Math.min(...pnlValues)
    const max = Math.max(...pnlValues)
    const binCount = 10
    const binSize = (max - min) / binCount

    const bins = Array(binCount).fill(0)
    const binLabels = []

    // Create bin labels
    for (let i = 0; i < binCount; i++) {
      const lowerBound = min + i * binSize
      const upperBound = min + (i + 1) * binSize
      binLabels.push(`${lowerBound.toFixed(0)}€ to ${upperBound.toFixed(0)}€`)
    }

    // Fill bins
    pnlValues.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1)
      bins[binIndex]++
    })

    // Create the chart
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
              title: (context) => {
                return context[0].label
              },
              label: (context) => {
                return `Operaciones: ${context.raw}`
              },
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
              text: "Rango de P&L",
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    })

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [trades])

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} aria-label="Profit Distribution Chart"></canvas>
    </div>
  )
}
