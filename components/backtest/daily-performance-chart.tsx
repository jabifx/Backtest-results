"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { DayStats } from "@/lib/types"

// Register Chart.js components
Chart.register(...registerables)

interface DailyPerformanceChartProps {
  dayStats: Record<string, DayStats>
}

export function DailyPerformanceChart({ dayStats }: DailyPerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Order days of the week correctly
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Prepare data in the correct order
    const orderedData = daysOrder.map((day) => {
      const stats = dayStats[day] || {
        TRADES: 0,
        WINS: 0,
        LOSSES: 0,
        WINRATE: 0,
        "P&L": 0,
        "AVG_P&L": 0,
      }
      return stats
    })

    const labels = daysOrder
    const plData = orderedData.map((day) => day["P&L"])
    const winrateData = orderedData.map((day) => day.WINRATE)

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "P&L (€)",
            data: plData,
            backgroundColor: plData.map((value) => (value >= 0 ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)")),
            borderColor: plData.map((value) => (value >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)")),
            borderWidth: 1,
            yAxisID: "y",
          },
          {
            label: "Winrate (%)",
            data: winrateData,
            type: "line",
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointRadius: 4,
            tension: 0.1,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterBody: (context) => {
                const index = context[0].dataIndex
                const day = orderedData[index]
                return [
                  `Trades: ${day.TRADES}`,
                  `Wins: ${day.WINS}`,
                  `Losses: ${day.LOSSES}`,
                  `Avg P&L: €${day["AVG_P&L"].toFixed(2)}`,
                ]
              },
            },
          },
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "P&L (€)",
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Winrate (%)",
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            title: {
              display: true,
              text: "Día de la Semana",
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
  }, [dayStats])

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} aria-label="Daily Performance Chart"></canvas>
    </div>
  )
}
