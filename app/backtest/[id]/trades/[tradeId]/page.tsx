import { notFound } from "next/navigation"
import { getBacktest } from "@/lib/backtest-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface TradeDetailPageProps {
  params: {
    id: string
    tradeId: string
  }
}

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
  try {
    const backtest = await getBacktest(params.id)
    const tradeIndex = Number.parseInt(params.tradeId)

    if (!backtest.trades || tradeIndex < 0 || tradeIndex >= backtest.trades.length) {
      notFound()
    }

    const trade = backtest.trades[tradeIndex]
    const previousTradeIndex = tradeIndex > 0 ? tradeIndex - 1 : null
    const nextTradeIndex = tradeIndex < backtest.trades.length - 1 ? tradeIndex + 1 : null

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }).format(value)
    }

    const formatPrice = (value: number) => {
      return value.toFixed(5)
    }

    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString)
      return {
        date: date.toLocaleDateString("es-ES"),
        time: date.toLocaleTimeString("es-ES"),
      }
    }

    const { date, time } = formatDateTime(trade.HORA)
    const isWin = trade.RESULTADO === "TP"

    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/backtest/${params.id}/trades`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Trades
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Trade #{tradeIndex + 1}</h1>
          </div>

          <div className="flex items-center gap-2">
            {previousTradeIndex !== null && (
              <Link href={`/backtest/${params.id}/trades/${previousTradeIndex}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
              </Link>
            )}
            {nextTradeIndex !== null && (
              <Link href={`/backtest/${params.id}/trades/${nextTradeIndex}`}>
                <Button variant="outline" size="sm">
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trade Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Trade Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {isWin ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    {trade.ORDEN} {backtest.config.SYMBOL}
                  </CardTitle>
                  <Badge variant={isWin ? "default" : "destructive"}>{trade.RESULTADO}</Badge>
                </div>
                <CardDescription>
                  {date} a las {time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Precio de Entrada</div>
                    <div className="text-lg font-semibold">{formatPrice(trade.ENTRADA)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Take Profit</div>
                    <div className="text-lg font-semibold text-green-600">{formatPrice(trade.TP || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Stop Loss</div>
                    <div className="text-lg font-semibold text-red-600">{formatPrice(trade.SL || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">P&L</div>
                    <div className={`text-lg font-semibold ${trade["P&L"] >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(trade["P&L"])}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Chart */}
            {trade.IMAGE && (
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico del Trade</CardTitle>
                  <CardDescription>Análisis técnico en el momento de la entrada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={`data:image/png;base64,${trade.IMAGE}`}
                      alt={`Gráfico del trade ${tradeIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trade Statistics */}
          <div className="space-y-6">
            {/* Trade Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Detalles del Trade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de Orden</span>
                  <Badge variant="outline">{trade.ORDEN}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resultado</span>
                  <Badge variant={isWin ? "default" : "destructive"}>{trade.RESULTADO}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entrada</span>
                  <span className="font-mono">{formatPrice(trade.ENTRADA)}</span>
                </div>
                {trade.SALIDA && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salida</span>
                    <span className="font-mono">{formatPrice(trade.SALIDA)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Take Profit</span>
                  <span className="font-mono text-green-600">{formatPrice(trade.TP || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span className="font-mono text-red-600">{formatPrice(trade.SL || 0)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>P&L Total</span>
                  <span className={trade["P&L"] >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(trade["P&L"])}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Información Temporal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span>{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora</span>
                  <span>{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Día de la Semana</span>
                  <span>{new Date(trade.HORA).toLocaleDateString("es-ES", { weekday: "long" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora del Día</span>
                  <span>{new Date(trade.HORA).getHours()}:00</span>
                </div>
              </CardContent>
            </Card>

            {/* Context in Backtest */}
            <Card>
              <CardHeader>
                <CardTitle>Contexto en el Backtest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trade #</span>
                  <span>
                    {tradeIndex + 1} de {backtest.trades.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progreso</span>
                  <span>{(((tradeIndex + 1) / backtest.trades.length) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((tradeIndex + 1) / backtest.trades.length) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading trade:", error)
    notFound()
  }
}
