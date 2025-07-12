import { notFound } from "next/navigation"
import { getBacktest } from "@/lib/backtest-service"
import { ConfigTable } from "@/components/backtest/config-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function ConfigPage({ params }: { params: { id: string } }) {
  try {
    const backtest = await getBacktest(params.id)

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Configuración</h1>

          <form action={`/api/backtest/${params.id}/download`} method="get">
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Exportar JSON
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Strategy Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Estrategia</CardTitle>
              <CardDescription>Parámetros utilizados para ejecutar el backtest</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigTable config={backtest.config} strategyConfig={backtest.strategy_config} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
