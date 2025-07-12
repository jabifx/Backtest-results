import { Card, CardContent } from "@/components/ui/card"
import { Calendar, TrendingUp, BarChart3, Percent, DollarSign } from "lucide-react"

interface ConfigSummaryProps {
  symbol: string
  strategy: string
  startDate: string
  endDate: string
  initialBalance: number
  risk: number
  riskReward: number
}

export function ConfigSummary({
  symbol,
  strategy,
  startDate,
  endDate,
  initialBalance,
  risk,
  riskReward,
}: ConfigSummaryProps) {
  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <Card className="shadow-md bg-muted/30">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Símbolo</div>
              <div className="font-medium">{symbol}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Estrategia</div>
              <div className="font-medium">{strategy}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Inicio</div>
              <div className="font-medium">{formatDate(startDate)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Fin</div>
              <div className="font-medium">{formatDate(endDate)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Balance Inicial</div>
              <div className="font-medium">€{initialBalance.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Riesgo</div>
              <div className="font-medium">{(risk * 100).toFixed(2)}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Risk/Reward</div>
              <div className="font-medium">{riskReward}:1</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
