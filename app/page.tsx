import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BarChart3, LineChart, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Trading Backtest <span className="text-blue-400">Visualizer</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto">
            Analiza el rendimiento de tus estrategias de trading con visualizaciones interactivas y métricas detalladas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-blue-400" />}
            title="Métricas Avanzadas"
            description="Analiza winrate, drawdown, profit factor y más con visualizaciones claras"
          />
          <FeatureCard
            icon={<LineChart className="h-10 w-10 text-blue-400" />}
            title="Análisis Temporal"
            description="Visualiza rendimiento por día, hora y mes para optimizar tus entradas"
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-blue-400" />}
            title="Historial Detallado"
            description="Revisa cada operación con filtros avanzados y análisis de resultados"
          />
        </div>

        <div className="pt-8">
          <Link href="/backtest/demo">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl">
              Ver Demo <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-white/10 border-none backdrop-blur-sm hover:bg-white/15 transition-all">
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto flex justify-center">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-blue-200">{description}</p>
      </CardContent>
    </Card>
  )
}
