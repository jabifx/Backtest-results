import { notFound } from "next/navigation"
import { getBacktest } from "@/lib/backtest-service"
import { TradesSummaryCards } from "@/components/backtest/trades-summary-cards"
import { EnhancedTradesTable } from "@/components/backtest/enhanced-trades-table"

interface TradesPageProps {
  params: {
    id: string
  }
}

export default async function TradesPage({ params }: TradesPageProps) {
  try {
    const backtest = await getBacktest(params.id)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Historial de Operaciones</h1>
          <p className="text-muted-foreground">Análisis detallado de todas las operaciones ejecutadas en el backtest</p>
        </div>

        <TradesSummaryCards trades={backtest.trades} />
        <EnhancedTradesTable trades={backtest.trades} backtestId={params.id} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
