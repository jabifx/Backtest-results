"use client"

import { Button } from "@/components/ui/button"
import { Download, Moon, Sun } from "lucide-react"

interface BacktestHeaderProps {
  symbol: string
  strategy: string
  theme: "light" | "dark"
  toggleTheme: () => void
  id: string
}

export function BacktestHeader({ symbol, strategy, theme, toggleTheme, id }: BacktestHeaderProps) {
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/backtest/${id}`)
      const data = await response.json()

      // Create a download link for the JSON data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `backtest-${symbol}-${strategy}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export backtest data:", error)
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold truncate">
          Trading Backtest: {symbol} - {strategy}
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            onClick={handleExport}
            aria-label="Export backtest data"
          >
            <Download className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
