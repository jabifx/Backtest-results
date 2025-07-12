import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, TrendingUp, AlertCircle, Info } from "lucide-react"
import type { BacktestStats } from "@/lib/types"

interface StrategyHealthCardProps {
  stats: BacktestStats
}

export function StrategyHealthCard({ stats }: StrategyHealthCardProps) {
  // Calcular la puntuación de salud de la estrategia (0-100)
  const calculateHealthScore = (): number => {
    // Factores positivos
    const winrateScore = Math.min((stats.WINRATE / 100) * 40, 40) // 40% de la puntuación
    const profitFactorScore = Math.min((stats["PROFIT FACTOR"] / 2) * 30, 30) // 30% de la puntuación
    const sharpeScore = Math.min((stats["SHARPE RATIO"] / 2) * 20, 20) // 20% de la puntuación

    // Factores negativos
    const mddPenalty = Math.min((stats.MDD / 30) * 10, 10) // Penalización por drawdown

    return Math.round(winrateScore + profitFactorScore + sharpeScore - mddPenalty)
  }

  const healthScore = calculateHealthScore()

  // Determinar el estado de salud
  const getHealthStatus = (): { label: string; color: string; icon: JSX.Element } => {
    if (healthScore >= 80) {
      return {
        label: "Excelente",
        color: "bg-green-500",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      }
    } else if (healthScore >= 60) {
      return {
        label: "Buena",
        color: "bg-blue-500",
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      }
    } else if (healthScore >= 40) {
      return {
        label: "Regular",
        color: "bg-amber-500",
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
      }
    } else {
      return {
        label: "Necesita mejoras",
        color: "bg-red-500",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      }
    }
  }

  const healthStatus = getHealthStatus()

  // Generar recomendaciones basadas en las estadísticas
  const getRecommendations = (): string[] => {
    const recommendations = []

    if (stats.WINRATE < 50) {
      recommendations.push("Mejorar la precisión de las señales de entrada")
    }

    if (stats["PROFIT FACTOR"] < 1.5) {
      recommendations.push("Optimizar la relación riesgo/beneficio")
    }

    if (stats.MDD > 15) {
      recommendations.push("Reducir el tamaño de posición para controlar el drawdown")
    }

    if (stats["LOSE STREAK"] > 5) {
      recommendations.push("Implementar reglas para pausar después de pérdidas consecutivas")
    }

    if (recommendations.length === 0) {
      recommendations.push("Mantener la estrategia actual, está funcionando bien")
    }

    return recommendations
  }

  const recommendations = getRecommendations()

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          {healthStatus.icon}
          Salud de la Estrategia
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Puntuación de salud */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Puntuación general</span>
              <Badge
                variant="outline"
                className={`${healthStatus.color.replace("bg-", "border-")} ${healthStatus.color.replace("bg-", "text-")}`}
              >
                {healthStatus.label}
              </Badge>
            </div>
            <Progress value={healthScore} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Necesita mejoras</span>
              <span>Excelente</span>
            </div>
          </div>

          {/* Métricas clave */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-muted/30 rounded-md p-2">
              <div className="text-xs text-muted-foreground">Winrate</div>
              <div className="text-lg font-semibold">{stats.WINRATE.toFixed(1)}%</div>
            </div>
            <div className="bg-muted/30 rounded-md p-2">
              <div className="text-xs text-muted-foreground">Profit Factor</div>
              <div className="text-lg font-semibold">{stats["PROFIT FACTOR"].toFixed(2)}</div>
            </div>
            <div className="bg-muted/30 rounded-md p-2">
              <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
              <div className="text-lg font-semibold">{stats["SHARPE RATIO"].toFixed(2)}</div>
            </div>
            <div className="bg-muted/30 rounded-md p-2">
              <div className="text-xs text-muted-foreground">Max Drawdown</div>
              <div className="text-lg font-semibold">{stats.MDD.toFixed(2)}%</div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="pt-2">
            <div className="flex items-center gap-1 mb-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Recomendaciones</h3>
            </div>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-xs flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
