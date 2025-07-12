import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Clock, Calendar, TrendingUp } from "lucide-react"
import type { BacktestConfig, StrategyConfig } from "@/lib/types"

interface ConfigTableProps {
  config: BacktestConfig
  strategyConfig: StrategyConfig
}

export function ConfigTable({ config, strategyConfig }: ConfigTableProps) {
  // Format trading hours for display
  const formatTradingHours = (hours: string[][]) => {
    return hours.map(([start, end]) => `${start} - ${end}`).join(", ")
  }

  // Filter and format excluded days (remove weekends if they're redundant)
  const formatExcludedDays = (days: string[]) => {
    const weekends = ["Saturday", "Sunday", "Sábado", "Domingo"]
    const filteredDays = days.filter((day) => !weekends.includes(day))

    if (filteredDays.length === 0) {
      return "Solo fines de semana (automático)"
    }

    return filteredDays.join(", ")
  }

  // Format timeframes for display
  const formatTimeframes = (tfs: string[]) => {
    return tfs.map((tf) => (
      <Badge key={tf} variant="secondary" className="mr-1">
        {tf}
      </Badge>
    ))
  }

  // Calculate trading period duration
  const calculateTradingPeriod = () => {
    const start = new Date(config.INICIO)
    const end = new Date(config.FIN)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.round(diffDays / 30.44)

    return `${diffDays} días (≈${diffMonths} meses)`
  }

  // Get risk level badge
  const getRiskBadge = (risk: number) => {
    const riskPercent = risk * 100
    if (riskPercent <= 1) return { variant: "default" as const, label: "Conservador" }
    if (riskPercent <= 2) return { variant: "secondary" as const, label: "Moderado" }
    return { variant: "destructive" as const, label: "Agresivo" }
  }

  const riskBadge = getRiskBadge(strategyConfig.RIESGO)

  // Organize config into sections
  const basicConfig = [
    { parameter: "Símbolo", value: config.SYMBOL, icon: <TrendingUp className="h-4 w-4" /> },
    { parameter: "Estrategia", value: config.STRATEGY, icon: <TrendingUp className="h-4 w-4" /> },
    {
      parameter: "Balance Inicial",
      value: `€${config.BALANCE.toLocaleString()}`,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    { parameter: "Período de Trading", value: calculateTradingPeriod(), icon: <Calendar className="h-4 w-4" /> },
  ]

  const tradingConfig = [
    {
      parameter: "Horarios de Trading",
      value: formatTradingHours(strategyConfig["TRADING HOURS"]),
      icon: <Clock className="h-4 w-4" />,
    },
    {
      parameter: "Días Excluidos",
      value: formatExcludedDays(strategyConfig["EXCLUDED DAYS"]),
      icon: <Calendar className="h-4 w-4" />,
    },
    { parameter: "Última Operación", value: `${strategyConfig["LAST TRADE"]}:00`, icon: <Clock className="h-4 w-4" /> },
  ]

  const riskConfig = [
    { parameter: "Riesgo por Operación", value: `${(strategyConfig.RIESGO * 100).toFixed(2)}%`, badge: riskBadge },
    { parameter: "Risk/Reward Ratio", value: `1:${strategyConfig.RR}` },
  ]

  const technicalConfig = [
    { parameter: "Tipo de Velas", value: config.VELAS },
    { parameter: "Spread", value: `${config.SPREAD} pips` },
    { parameter: "Comisión", value: `€${config.COMISSION}` },
  ]

  return (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Configuración Básica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {basicConfig.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {item.icon}
                    {item.parameter}
                  </TableCell>
                  <TableCell>{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trading Configuration */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuración de Trading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {tradingConfig.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {item.icon}
                    {item.parameter}
                  </TableCell>
                  <TableCell>{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Timeframes */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Marcos Temporales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">{formatTimeframes(strategyConfig.TFs)}</div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Gestión de Riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {riskConfig.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                  <TableCell className="font-medium">{item.parameter}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {item.value}
                    {item.badge && <Badge variant={item.badge.variant}>{item.badge.label}</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Technical Configuration */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Configuración Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {technicalConfig.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                  <TableCell className="font-medium">{item.parameter}</TableCell>
                  <TableCell>{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Los fines de semana se excluyen automáticamente del análisis ya que los mercados forex están cerrados. Solo se
          muestran las horas y días con actividad de trading registrada.
        </AlertDescription>
      </Alert>
    </div>
  )
}
