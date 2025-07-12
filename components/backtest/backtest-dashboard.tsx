"use client"

import { useState } from "react"
import { BacktestHeader } from "./backtest-header"
import { OverviewMetrics } from "./overview-metrics"
import { ConfigTable } from "./config-table"
import { DailyPerformanceChart } from "./daily-performance-chart"
import { HourlyPerformanceChart } from "./hourly-performance-chart"
import { MonthlyProfitabilityChart } from "./monthly-profitability-chart"
import { TradesTable } from "./trades-table"
import type { BacktestData } from "@/lib/types"

interface BacktestDashboardProps {
  backtest: BacktestData
  id: string
}

export function BacktestDashboard({ backtest, id }: BacktestDashboardProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
    // This would normally use a theme provider, but for simplicity we're just toggling a state
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <BacktestHeader
        symbol={backtest.config.SYMBOL}
        strategy={backtest.config.STRATEGY}
        theme={theme}
        toggleTheme={toggleTheme}
        id={id}
        stats={backtest.stats}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl ml-80">
        <div className="space-y-8">
          <OverviewMetrics stats={backtest.stats} />

          <ConfigTable config={backtest.config} strategyConfig={backtest.strategy_config} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DailyPerformanceChart dayStats={backtest.day_stats} />
            <HourlyPerformanceChart hourStats={backtest.hour_stats} />
          </div>

          <MonthlyProfitabilityChart monthlyStats={backtest.monthly_stats} />

          <TradesTable trades={backtest.trades} />
        </div>
      </main>
    </div>
  )
}
