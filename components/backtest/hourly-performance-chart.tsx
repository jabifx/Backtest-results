"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { HourStats } from "@/lib/types"

// Register Chart.js components
Chart.register(...registerables)

interface HourlyPerformanceChartProps {
  hourStats: Record<string, HourStats>
}

export function HourlyPerformanceChart({ hourStats }: HourlyPerformanceChartProps) {
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

    // Prepare data in order from 0 to 23
    const hours = Array.from({ length: 24 }, (_, i) => i.toString())

    const orderedData = hours.map((hour) => {
      const stats = hourStats[hour] || {
        TRADES: 0,
        WINS: 0,
        LOSSES: 0,
        WINRATE: 0,
        "P&L": 0,
        "AVG_P&L": 0,
      }
      return stats
    })

    const labels = hours.map((hour) => `${hour}:00`)
    const plData = orderedData.map((hour) => hour["P&L"])
    const winrateData = orderedData.map((hour) => hour.WINRATE)

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "P&L (€)",
            data: plData,
            borderColor: "rgb(20, 184, 166)",
            backgroundColor: "rgba(20, 184, 166, 0.1)",
            borderWidth: 2,
            pointBackgroundColor: (context) => {
              const value = context.raw as number
              return value >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
            },
            pointRadius: 4,
            tension: 0.3,
            yAxisID: "y",
            fill: true,
          },
          {
            label: "Winrate (%)",
            data: winrateData,
            borderColor: "rgb(79, 70, 229)",
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            borderWidth: 2,
            pointBackgroundColor: "rgb(79, 70, 229)",
            pointRadius: 4,
            tension: 0.3,
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
                const hour = orderedData[index]
                return [
                  `Trades: ${hour.TRADES}`,
                  `Wins: ${hour.WINS}`,
                  `Losses: ${hour.LOSSES}`,
                  `Avg P&L: €${hour["AVG_P&L"].toFixed(2)}`,
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
              text: "Hora del Día",
            },
            ticks: {
              callback: (value, index) => {
                // Show fewer labels on mobile
                return index % 3 === 0 ? labels[index] : ""
              },
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
  }, [hourStats])

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} aria-label="Hourly Performance Chart"></canvas>
    </div>
  )
}
