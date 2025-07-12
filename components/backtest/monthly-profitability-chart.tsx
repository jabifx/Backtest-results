"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { MonthlyStats } from "@/lib/types"

// Register Chart.js components
Chart.register(...registerables)

interface MonthlyProfitabilityChartProps {
  monthlyStats: MonthlyStats
}

export function MonthlyProfitabilityChart({ monthlyStats }: MonthlyProfitabilityChartProps) {
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

    // Month order
    const monthOrder = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    // Get all years from the data
    const years = Object.keys(monthlyStats).sort()

    // Prepare datasets for each year
    const datasets = years.map((year, index) => {
      const yearData = monthlyStats[year]
      const data = monthOrder.map((month) => yearData[month] || 0)

      // Generate a color based on the index
      const hue = (index * 137) % 360 // Golden angle approximation for good distribution

      return {
        label: year,
        data,
        backgroundColor: data.map((value) => (value >= 0 ? `rgba(34, 197, 94, 0.7)` : `rgba(239, 68, 68, 0.7)`)),
        borderColor: data.map((value) => (value >= 0 ? `rgb(34, 197, 94)` : `rgb(239, 68, 68)`)),
        borderWidth: 1,
      }
    })

    // Calculate cumulative data across all years
    const cumulativeData = monthOrder.map((month, monthIndex) => {
      let sum = 0
      years.forEach((year) => {
        const yearData = monthlyStats[year]
        sum += yearData[month] || 0
      })
      return sum
    })

    // Add cumulative line dataset
    datasets.push({
      label: "Acumulado",
      data: cumulativeData,
      type: "line",
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: "rgb(59, 130, 246)",
      pointRadius: 4,
      fill: false,
      yAxisID: "y1",
    })

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: monthOrder,
        datasets,
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
              label: (context) => {
                const label = context.dataset.label || ""
                const value = context.parsed.y
                return `${label}: ${value.toFixed(2)}%`
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
              text: "Rentabilidad Mensual (%)",
            },
            stacked: true,
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Rentabilidad Acumulada (%)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            title: {
              display: true,
              text: "Mes",
            },
            stacked: true,
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
  }, [monthlyStats])

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} aria-label="Monthly Profitability Chart"></canvas>
    </div>
  )
}
