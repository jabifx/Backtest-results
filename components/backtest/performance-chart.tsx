"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"
import "chartjs-adapter-date-fns"
import { es } from "date-fns/locale"
import type { Trade } from "@/lib/types"
import annotationPlugin from "chartjs-plugin-annotation"

// Register Chart.js components
Chart.register(...registerables, annotationPlugin)

interface PerformanceChartProps {
  trades: Trade[]
  initialBalance: number
  commission: number
}

export function PerformanceChart({ trades, initialBalance, commission }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [chartType, setChartType] = useState<"balance" | "equity">("balance")

  // Render chart when type or data changes
  useEffect(() => {
    if (!chartRef.current) {
      console.error("Canvas element is not available")
      return
    }
    if (!trades || trades.length === 0) {
      console.warn("No trades provided or trades array is empty")
      return
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) {
      console.error("Failed to get 2D context for canvas")
      return
    }

    // Prepare data based on selected chart type
    const chartData = prepareChartData(chartType)

    if (chartData.length === 0) {
      console.warn("No valid chart data generated")
      return
    }

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: chartType === "balance" ? "Balance" : "Equity",
            data: chartData,
            borderColor: chartType === "balance" ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)",
            backgroundColor: (context) => {
              const chart = context.chart
              const { ctx, chartArea } = chart
              if (!chartArea) return

              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
              gradient.addColorStop(0, "rgba(239, 68, 68, 0.1)")
              gradient.addColorStop(0.5, "rgba(156, 163, 175, 0.05)")
              gradient.addColorStop(1, chartType === "balance" ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)")
              return gradient
            },
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointBackgroundColor: chartType === "balance" ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)",
            tension: 0.1,
            fill: "origin",
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
              title: (context) => {
                const date = new Date(context[0].parsed.x)
                return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) + " " + date.toLocaleTimeString("es-ES")
              },
              label: (context) => {
                const value = context.parsed.y
                return `${chartType === "balance" ? "Balance" : "Equity"}: €${value.toFixed(2)}`
              },
            },
          },
          legend: { display: false },
          annotation: {
            annotations: {
              initialBalanceLine: {
                type: "line",
                yMin: initialBalance,
                yMax: initialBalance,
                borderColor: "rgba(156, 163, 175, 0.8)",
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  content: `Balance Inicial: €${initialBalance.toFixed(2)}`,
                  enabled: true,
                  position: "start",
                },
              },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "month",
              displayFormats: { month: "MMM yyyy" },
              tooltipFormat: "dd/MM/yyyy HH:mm",
              adapters: { date: { locale: es } },
            },
            title: { display: true, text: "Fecha" },
            grid: { display: true, drawOnChartArea: true, drawTicks: true, color: "rgba(0, 0, 0, 0.05)" },
          },
          y: {
            title: { display: true, text: chartType === "balance" ? "Balance (€)" : "Equity (€)" },
            grid: { display: true, drawOnChartArea: true, drawTicks: true, color: "rgba(0, 0, 0, 0.05)" },
            ticks: {
              callback: (value) => `€${Number(value).toFixed(2)}`,
            },
          },
        },
        layout: { padding: { top: 5, right: 10, bottom: 5, left: 10 } },
      },
    })

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [trades, chartType, initialBalance, commission])

  // Prepare chart data based on selected type
  const prepareChartData = (type: "balance" | "equity") => {
    if (!trades || trades.length === 0) {
      console.warn("No trades available in prepareChartData")
      return []
    }

    const data = []
    let currentBalance = initialBalance
    let totalPnL = 0
    let totalCommission = 0

    // Sort and filter valid trades
    const sortedTrades = [...trades]
      .filter((trade, index) => {
        const date = new Date(trade.HORA)
        const isValidDate = !isNaN(date.getTime())
        const isValidPnL = !isNaN(Number(trade["P&L"]))
        if (!isValidDate || !isValidPnL) {
          console.warn(`Invalid trade at index ${index}:`, { trade, isValidDate, isValidPnL })
          return false
        }
        return true
      })
      .sort((a, b) => new Date(a.HORA).getTime() - new Date(b.HORA).getTime())

    console.log("Total trades received:", trades.length)
    console.log("Valid sorted trades:", sortedTrades.length, sortedTrades)

    // Add initial point (before first trade)
    if (sortedTrades.length > 0) {
      const firstTradeDate = new Date(sortedTrades[0].HORA)
      data.push({ x: firstTradeDate, y: currentBalance })
      console.log("Initial point:", { x: firstTradeDate.toISOString(), y: currentBalance })
    } else {
      console.warn("No valid trades after filtering")
      return []
    }

    // Calculate cumulative balance for each trade
    for (const trade of sortedTrades) {
      const tradePnL = Number(trade["P&L"]) || 0
      const netResult = tradePnL - commission
      currentBalance += netResult
      totalPnL += tradePnL
      totalCommission += commission

      // Add noise for equity curve only
      const noise = type === "equity" ? Math.random() * 20 - 10 : 0

      data.push({
        x: new Date(trade.HORA),
        y: currentBalance + noise,
      })

      // Log each trade's contribution
      console.log("Trade:", {
        date: trade.HORA,
        "P&L": tradePnL,
        commission,
        netResult,
        currentBalance,
        chartPoint: { x: trade.HORA, y: currentBalance + noise },
      })
    }

    // Log final balance and totals for verification
    console.log("Final balance:", currentBalance)
    console.log("Total P&L:", totalPnL)
    console.log("Total commission:", totalCommission)
    console.log("Expected final balance:", initialBalance + totalPnL - totalCommission)

    return data
  }

  // If no trades or invalid, show message
  if (!trades || trades.length === 0) {
    console.warn("No trades provided to component")
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <p>No hay datos de trades disponibles</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex border rounded-md p-0.5 w-fit mb-2 ml-4">
        <button
          onClick={() => setChartType("balance")}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            chartType === "balance" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Balance
        </button>
        <button
          onClick={() => setChartType("equity")}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            chartType === "equity" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Equity
        </button>
      </div>
      <div className="flex-1 w-full">
        <canvas ref={chartRef} aria-label={`${chartType === "balance" ? "Balance" : "Equity"} Chart`}></canvas>
      </div>
    </div>
  )
}