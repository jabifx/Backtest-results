import type React from "react"
import { notFound } from "next/navigation"
import { getBacktest } from "@/lib/backtest-service"
import { BacktestNavigation } from "@/components/backtest/backtest-navigation"
import { MobileNavigation } from "@/components/backtest/mobile-navigation"
import { ThemeSwitcher } from "@/components/backtest/theme-switcher"

export default async function BacktestLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  try {
    const backtest = await getBacktest(params.id)

    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Navigation */}
        <BacktestNavigation
          className="hidden lg:flex"
          symbol={backtest.config.SYMBOL}
          strategy={backtest.config.STRATEGY}
          id={params.id}
          stats={backtest.stats}
        />

        {/* Mobile Navigation */}
        <MobileNavigation
          className="lg:hidden"
          symbol={backtest.config.SYMBOL}
          strategy={backtest.config.STRATEGY}
          id={params.id}
        />

        {/* Main Content */}
        <div className="lg:pl-80">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{backtest.config.SYMBOL}</div>
                <div className="text-sm text-muted-foreground">{backtest.config.STRATEGY}</div>
              </div>
              <ThemeSwitcher />
            </div>
          </div>

          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
