import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { BacktestStats } from "@/lib/types"

interface PerformanceMetricsTableProps {
  stats: BacktestStats
}

export function PerformanceMetricsTable({ stats }: PerformanceMetricsTableProps) {
  // Definir las métricas a mostrar con sus descripciones
  const metrics = [
    {
      category: "Rentabilidad",
      items: [
        { name: "P&L", value: `€${stats["P&L"].toFixed(2)}`, description: "Ganancia o pérdida total" },
        {
          name: "Rentabilidad",
          value: `${((stats["P&L"] / stats["BALANCE INICIAL"]) * 100).toFixed(2)}%`,
          description: "Porcentaje de retorno sobre el capital inicial",
        },
        {
          name: "Profit Factor",
          value: stats["PROFIT FACTOR"].toFixed(2),
          description: "Ratio entre ganancias y pérdidas",
        },
        {
          name: "Expectativa",
          value: `€${stats["EXPECTANCY"].toFixed(2)}`,
          description: "Ganancia media por operación",
        },
      ],
    },
    {
      category: "Operaciones",
      items: [
        { name: "Total Operaciones", value: stats["OPERACIONES"], description: "Número total de operaciones" },
        { name: "Ganadas", value: stats["GANADAS"], description: "Operaciones con resultado positivo" },
        { name: "Perdidas", value: stats["PERDIDAS"], description: "Operaciones con resultado negativo" },
        {
          name: "Winrate",
          value: `${stats["WINRATE"].toFixed(2)}%`,
          description: "Porcentaje de operaciones ganadoras",
        },
      ],
    },
    {
      category: "Riesgo",
      items: [
        { name: "Max Drawdown", value: `${stats["MDD"].toFixed(2)}%`, description: "Máxima caída desde un pico" },
        {
          name: "Sharpe Ratio",
          value: stats["SHARPE RATIO"].toFixed(2),
          description: "Rendimiento ajustado al riesgo",
        },
        { name: "Racha Ganadora", value: stats["WIN STREAK"], description: "Máxima racha de operaciones ganadoras" },
        { name: "Racha Perdedora", value: stats["LOSE STREAK"], description: "Máxima racha de operaciones perdedoras" },
      ],
    },
    {
      category: "Resultados",
      items: [
        { name: "Balance Inicial", value: `€${stats["BALANCE INICIAL"].toFixed(2)}`, description: "Capital inicial" },
        { name: "Balance Final", value: `€${stats["BALANCE"].toFixed(2)}`, description: "Capital final" },
        {
          name: "Ganancia Media",
          value: `€${stats["AVG WIN"].toFixed(2)}`,
          description: "Ganancia media por operación ganadora",
        },
        {
          name: "Pérdida Media",
          value: `€${Math.abs(stats["AVG LOSS"]).toFixed(2)}`,
          description: "Pérdida media por operación perdedora",
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {metrics.map((category, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-lg font-medium">{category.category}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Métrica</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="hidden md:table-cell">Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {category.items.map((metric, metricIndex) => (
                <TableRow key={metricIndex}>
                  <TableCell className="font-medium">{metric.name}</TableCell>
                  <TableCell>
                    {typeof metric.value === "number" ? (
                      metric.value
                    ) : metric.value.includes("%") ? (
                      <Badge
                        variant={
                          metric.name === "Max Drawdown"
                            ? Number.parseFloat(metric.value) < 15
                              ? "default"
                              : "destructive"
                            : Number.parseFloat(metric.value) > 0
                              ? "default"
                              : "destructive"
                        }
                      >
                        {metric.value}
                      </Badge>
                    ) : metric.value.includes("€") ? (
                      <span
                        className={
                          metric.name === "Pérdida Media"
                            ? "text-red-500 font-medium"
                            : metric.name === "Ganancia Media" || metric.name === "P&L"
                              ? Number.parseFloat(metric.value.replace("€", "")) >= 0
                                ? "text-green-500 font-medium"
                                : "text-red-500 font-medium"
                              : ""
                        }
                      >
                        {metric.value}
                      </span>
                    ) : (
                      metric.value
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{metric.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
