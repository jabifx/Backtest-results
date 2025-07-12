"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
import type { DayStats, HourStats } from "@/lib/types"

// Register Chart.js components
Chart.register(...registerables)

interface WinrateByTimeCardProps {
  title: string
  data: Record<string, DayStats | HourStats>
  type: "day" | "hour"
}

export function WinrateByTimeCard({ title, data, type }: WinrateByTimeCardProps) {
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

    let labels: string[] = []
    let dataPoints: (DayStats | HourStats)[] = []

    if (type === "day") {
      // Order days of the week correctly
      const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      labels = daysOrder
      dataPoints = daysOrder.map(
        (day) =>
          data[day] || {
            TRADES: 0,
            WINS: 0,
            LOSSES: 0,
            WINRATE: 0,
            "P&L": 0,
            "AVG_P&L": 0,
          },
      )
    } else {
      // Order hours from 0 to 23
      const hours = Array.from({ length: 24 }, (_, i) => i.toString())
      labels = hours.map((hour) => `${hour}:00`)
      dataPoints = hours.map(
        (hour) =>
          data[hour] || {
            TRADES: 0,
            WINS: 0,
            LOSSES: 0,
            WINRATE: 0,
            "P&L": 0,
            "AVG_P&L": 0,
          },
      )
    }

    const winrateData = dataPoints.map((item) => item.WINRATE)
    const tradesData = dataPoints.map((item) => item.TRADES)

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Winrate (%)",
            data: winrateData,
            backgroundColor: winrateData.map((value) =>
              value >= 50 ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)",
            ),
            borderColor: winrateData.map((value) => (value >= 50 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)")),
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: "y",
          },
          {
            label: "Operaciones",
            data: tradesData,
            type: "line",
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointRadius: 3,
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
                const item = dataPoints[index]
                return [
                  `Ganadas: ${item.WINS}`,
                  `Perdidas: ${item.LOSSES}`,
                  `P&L: €${item["P&L"].toFixed(2)}`,
                  `Avg P&L: €${item["AVG_P&L"].toFixed(2)}`,
                ]
              },
            },
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Winrate (%)",
            },
            min: 0,
            max: 100,
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Operaciones",
            },
            min: 0,
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            ticks: {
              callback: (value, index) => {
                // Show fewer labels on mobile for hours
                if (type === "hour") {
                  return index % 3 === 0 ? labels[index] : ""
                }
                return labels[index]
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
  }, [data, type, title])

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <canvas ref={chartRef} aria-label={`${title} Chart`}></canvas>
        </div>
      </CardContent>
    </Card>
  )
}
