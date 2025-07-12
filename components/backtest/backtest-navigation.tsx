"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronRight,
  Home,
  LineChart,
  List,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from "lucide-react"
import type { BacktestStats } from "@/lib/types"

interface BacktestNavigationProps {
  className?: string
  symbol: string | string[]
  strategy: string
  id: string
  stats?: BacktestStats
}

export function BacktestNavigation({ className, symbol, strategy, id, stats }: BacktestNavigationProps) {
  const pathname = usePathname()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getProfitColor = (value: number) => {
    return value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  const getWinrateColor = (winrate: number) => {
    if (winrate >= 60) return "text-green-600 dark:text-green-400"
    if (winrate >= 50) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className={cn("w-80 bg-background border-r flex flex-col fixed inset-y-0", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div className="font-bold text-xl text-primary">{strategy}</div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {Array.isArray(symbol) ? symbol.join(", ") : symbol}
          </div>
          <Badge variant="secondary" className="text-xs">
            {stats?.OPERACIONES || 0} operaciones
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <div className="py-3 px-3 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Navegación</div>

        <NavItem
          href={`/backtest/${id}`}
          icon={<Home className="h-4 w-4" />}
          label="Dashboard"
          isActive={pathname === `/backtest/${id}`}
        />
        <NavItem
          href={`/backtest/${id}/trades`}
          icon={<List className="h-4 w-4" />}
          label="Historial de Operaciones"
          isActive={pathname === `/backtest/${id}/trades`}
        />
        <NavItem
          href={`/backtest/${id}/analysis`}
          icon={<LineChart className="h-4 w-4" />}
          label="Análisis Detallado"
          isActive={pathname === `/backtest/${id}/analysis`}
        />
        <NavItem
          href={`/backtest/${id}/config`}
          icon={<Settings className="h-4 w-4" />}
          label="Configuración"
          isActive={pathname === `/backtest/${id}/config`}
        />
      </div>

      <Separator />

      {/* Quick Stats - Only show if stats are available */}
      {stats && (
        <div className="flex-1 p-3 space-y-3 overflow-hidden">
          <Card className="shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Resumen Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">P&L</span>
                </div>
                <span className={cn("font-semibold text-sm", getProfitColor(stats["P&L"]))}>
                  {formatCurrency(stats["P&L"])}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Percent className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">Winrate</span>
                </div>
                <span className={cn("font-semibold text-sm", getWinrateColor(stats.WINRATE))}>
                  {formatPercentage(stats.WINRATE)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs">Ganadas</span>
                </div>
                <span className="font-semibold text-sm text-green-600 dark:text-green-400">{stats.GANADAS}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs">Perdidas</span>
                </div>
                <span className="font-semibold text-sm text-red-600 dark:text-red-400">{stats.PERDIDAS}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Métricas Clave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-xs">Profit Factor</span>
                <Badge variant={stats["PROFIT FACTOR"] >= 1.5 ? "default" : "secondary"} className="text-xs h-5">
                  {stats["PROFIT FACTOR"].toFixed(2)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs">Sharpe Ratio</span>
                <Badge variant={stats["SHARPE RATIO"] >= 1 ? "default" : "secondary"} className="text-xs h-5">
                  {stats["SHARPE RATIO"].toFixed(2)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs">Max DD</span>
                <span className="font-semibold text-sm text-red-600 dark:text-red-400">
                  {formatPercentage(Math.abs(stats.MDD))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-3 border-t bg-muted/20">
        <Link href="/">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <ChevronRight className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}) {
  return (
    <Link href={href} className="block">
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 font-normal h-9 text-sm",
          isActive && "bg-primary/10 text-primary border-primary/20",
        )}
      >
        {icon}
        <span className="truncate">{label}</span>
      </Button>
    </Link>
  )
}
