import { notFound } from "next/navigation"
import { getBacktest } from "@/lib/backtest-service"
import { PerformanceChart } from "@/components/backtest/performance-chart"
import { StatsHighlights } from "@/components/backtest/stats-highlights"
import { ConfigSummary } from "@/components/backtest/config-summary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyProfitabilityTable } from "@/components/backtest/monthly-profitability-table"
import { TrendingUp, BarChart3, Calendar, AlertTriangle } from "lucide-react"
import { StrategyHealthCard as StrategyHealthCardComponent } from "@/components/backtest/strategy-health-card"

// Type definitions
interface Trade {
  HORA: string;
  RESULTADO: 'TP' | 'SL';
  [key: string]: any;
}

interface DayStats {
  'P&L': number;
  WINRATE: number;
  OPERACIONES: number;
}

interface HourStats {
  'P&L': number;
  WINRATE: number;
  OPERACIONES: number;
}

interface BacktestStats {
  'P&L': number;
  'BALANCE': number;
  'BALANCE INICIAL': number;
  'WINRATE': number;
  'OPERACIONES': number;
}

interface BacktestConfig {
  SYMBOL: string;
  STRATEGY: string;
  INICIO: string;
  FIN: string;
  BALANCE: number;
  SPREAD: number;
  COMISSION: number;
  VELAS: number;
}

interface StrategyConfig {
  RIESGO: number;
  RR: number;
  TIPO?: string;
  DESCRIPCION?: string;
  'TRADING HOURS': [string, string][];
  'EXCLUDED DAYS': string[];
  'LAST TRADE': string;
  TFs: string[];
}

interface BacktestData {
  trades: Trade[];
  stats: BacktestStats;
  config: BacktestConfig;
  strategy_config: StrategyConfig;
  day_stats: Record<string, DayStats>;
  hour_stats: Record<string, HourStats>;
  monthly_stats: Record<string, Record<string, number>>;
}

interface BestWorstDay {
  day: string;
  stats: DayStats;
}

interface BestWorstHour {
  hour: string;
  stats: HourStats;
}

// Utility functions
const formatCurrency = (amount: number): string => `€${amount.toFixed(2)}`;
const formatPercentage = (value: number): string => `${value.toFixed(2)}%`;

// Helper function to find best/worst periods
const findBestAndWorst = <T extends { 'P&L': number }>(
    entries: [string, T][]
): { best: { period: string; stats: T } | null; worst: { period: string; stats: T } | null } => {
  if (entries.length === 0) {
    return { best: null, worst: null };
  }

  let best: { period: string; stats: T } | null = null;
  let worst: { period: string; stats: T } | null = null;

  entries.forEach(([period, stats]) => {
    if (!best || stats["P&L"] > best.stats["P&L"]) {
      best = { period, stats };
    }
    if (!worst || stats["P&L"] < worst.stats["P&L"]) {
      worst = { period, stats };
    }
  });

  return { best, worst };
};

// Sub-components
const TradingInsightCard = ({
                              icon: Icon,
                              title,
                              period,
                              winrate,
                              pnl,
                              type
                            }: {
  icon: any;
  title: string;
  period: string;
  winrate: number;
  pnl: number;
  type: 'positive' | 'negative';
}) => {
  const colorClass = type === 'positive' ? 'text-green-500' : 'text-red-500';

  return (
      <div className="border rounded-lg p-4 bg-muted/20" role="region" aria-label={`${title} insight`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-5 w-5 ${colorClass}`} aria-hidden="true" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="text-2xl font-bold">{period}</div>
        <div className="text-sm text-muted-foreground mt-1">
          Winrate: {formatPercentage(winrate)}
        </div>
        <div className={`text-sm ${colorClass} font-medium mt-1`}>
          P&L: {formatCurrency(pnl)}
        </div>
      </div>
  );
};

const TradingInsights = ({
                           bestDay,
                           worstDay,
                           bestHour,
                           worstHour
                         }: {
  bestDay: BestWorstDay | null;
  worstDay: BestWorstDay | null;
  bestHour: BestWorstHour | null;
  worstHour: BestWorstHour | null;
}) => (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Insights de Trading</CardTitle>
        <CardDescription>Análisis de patrones y momentos óptimos para operar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestDay && (
              <TradingInsightCard
                  icon={TrendingUp}
                  title="Mejor día para operar"
                  period={bestDay.day}
                  winrate={bestDay.stats.WINRATE}
                  pnl={bestDay.stats["P&L"]}
                  type="positive"
              />
          )}

          {worstDay && (
              <TradingInsightCard
                  icon={AlertTriangle}
                  title="Día a evitar"
                  period={worstDay.day}
                  winrate={worstDay.stats.WINRATE}
                  pnl={worstDay.stats["P&L"]}
                  type="negative"
              />
          )}

          {bestHour && (
              <TradingInsightCard
                  icon={Calendar}
                  title="Mejor hora para operar"
                  period={`${bestHour.hour}:00`}
                  winrate={bestHour.stats.WINRATE}
                  pnl={bestHour.stats["P&L"]}
                  type="positive"
              />
          )}

          {worstHour && (
              <TradingInsightCard
                  icon={BarChart3}
                  title="Hora a evitar"
                  period={`${worstHour.hour}:00`}
                  winrate={worstHour.stats.WINRATE}
                  pnl={worstHour.stats["P&L"]}
                  type="negative"
              />
          )}
        </div>
      </CardContent>
    </Card>
);

const StrategyGeneralInfo = ({
                                 config,
                                 strategyConfig,
                             }: {
    config: BacktestConfig
    strategyConfig: StrategyConfig
}) => (
    <Card className="shadow-md mb-4">
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-4">
                        <div className="text-xs text-muted-foreground mb-1">Nombre de la Estrategia</div>
                        <div className="text-base font-semibold">{config.STRATEGY}</div>
                    </div>
                    <div className="mb-4">
                        <div className="text-xs text-muted-foreground mb-1">Tipo</div>
                        <div className="text-sm">{strategyConfig.TIPO || "No especificado"}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground mb-1">Activo Principal</div>
                        <div className="text-sm">{config.SYMBOL}</div>
                    </div>
                </div>
                <div>
                    <div className="mb-4">
                        <div className="text-xs text-muted-foreground mb-1">Descripción</div>
                        <div className="text-sm">{strategyConfig.DESCRIPCION || "Sin descripción disponible"}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground mb-1">Activos Recomendados</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {[config.SYMBOL, "DAX", "S&P 500"].map(asset => (
                                <span
                                    key={asset}
                                    className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md"
                                >
                  {asset}
                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)

const TradingSchedule = ({ strategyConfig }: { strategyConfig: StrategyConfig }) => (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
        <Calendar className="h-4 w-4 mr-1 text-primary" aria-hidden="true" />
        Horarios y Calendario
      </h3>
      <div className="space-y-3">
        {/* Horarios de Trading */}
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Horarios de Trading</div>
          <div className="space-y-1">
            {strategyConfig["TRADING HOURS"].map((hours, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" aria-hidden="true"></div>
                  <span className="text-sm">
                {hours[0]} - {hours[1]}
              </span>
                </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Última operación permitida: {strategyConfig["LAST TRADE"]}:00
          </div>
        </div>

        {/* Días Excluidos */}
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Días Excluidos</div>
          {strategyConfig["EXCLUDED DAYS"].length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {strategyConfig["EXCLUDED DAYS"].map((day, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-muted rounded-md">
                {day}
              </span>
                ))}
              </div>
          ) : (
              <div className="text-sm">No hay días excluidos</div>
          )}
        </div>
      </div>
    </div>
);

const RiskAndAnalysis = ({
                           config,
                           strategyConfig
                         }: {
  config: BacktestConfig;
  strategyConfig: StrategyConfig;
}) => (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
        <TrendingUp className="h-4 w-4 mr-1 text-primary" aria-hidden="true" />
        Riesgo y Análisis
      </h3>
      <div className="space-y-3">
        {/* Gestión de Riesgo */}
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Gestión de Riesgo</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded p-2">
              <div className="text-xs text-muted-foreground">Riesgo por Operación</div>
              <div className="text-lg font-semibold">
                {formatPercentage(strategyConfig.RIESGO * 100)}
              </div>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <div className="text-xs text-muted-foreground">Ratio Riesgo/Beneficio</div>
              <div className="text-lg font-semibold">{strategyConfig.RR}:1</div>
            </div>
          </div>
        </div>

        {/* Timeframes */}
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Timeframes Analizados</div>
          <div className="flex flex-wrap gap-2">
            {strategyConfig.TFs.map((tf, index) => (
                <span
                    key={index}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md"
                >
              {tf}
            </span>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Velas analizadas: {config.VELAS}
          </div>
        </div>

        {/* Costes */}
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Costes de Trading</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded p-2">
              <div className="text-xs text-muted-foreground">Spread</div>
              <div className="text-lg font-semibold">{config.SPREAD}</div>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <div className="text-xs text-muted-foreground">Comisión</div>
              <div className="text-lg font-semibold">{formatCurrency(config.COMISSION)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
);

const StrategyConfigSection = ({
                                 config,
                                 strategyConfig
                               }: {
  config: BacktestConfig;
  strategyConfig: StrategyConfig;
}) => (
    <Card className="shadow-md">
      <CardHeader className="pb-2 ">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
          Configuración de Estrategia
        </CardTitle>
        <CardDescription>Parámetros clave que definen el comportamiento de la estrategia</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <StrategyGeneralInfo config={config} strategyConfig={strategyConfig} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TradingSchedule strategyConfig={strategyConfig} />
          <RiskAndAnalysis config={config} strategyConfig={strategyConfig} />
        </div>
      </CardContent>
    </Card>
);

// Main component
export default async function DashboardPage({ params }: { params: { id: string } }) {
  try {
    const backtest: BacktestData = await getBacktest(params.id);

    if (!backtest || !backtest.stats || !backtest.config) {
      notFound();
    }

    const profitPercentage = backtest.stats["BALANCE INICIAL"] > 0
        ? ((backtest.stats["P&L"] / backtest.stats["BALANCE INICIAL"]) * 100).toFixed(2)
        : "0.00";

    // Process day statistics
    const dayStats = Object.entries(backtest.day_stats || {});
    const { best: bestDay, worst: worstDay } = findBestAndWorst(dayStats);

    // Process hour statistics
    const hourStats = Object.entries(backtest.hour_stats || {});
    const { best: bestHour, worst: worstHour } = findBestAndWorst(hourStats);

    return (
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          </header>

          {/* Config Summary */}
          <ConfigSummary
              symbol={backtest.config.SYMBOL}
              strategy={backtest.config.STRATEGY}
              startDate={backtest.config.INICIO}
              endDate={backtest.config.FIN}
              initialBalance={backtest.config.BALANCE}
              risk={backtest.strategy_config.RIESGO}
              riskReward={backtest.strategy_config.RR}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Primera fila: Gráfico y Estadísticas */}
            <div className="lg:col-span-9 grid grid-rows-[320px_auto] gap-4">
              {/* Performance Chart */}
              <Card className="shadow-md flex flex-col">
                <CardHeader className="pb-0 pt-3 px-4">
                  <CardTitle className="text-base">Evolución del Capital</CardTitle>
                  <CardDescription className="text-xs">
                    Seguimiento del balance a lo largo del tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 flex-1 overflow-hidden">
                  <PerformanceChart
                      trades={backtest.trades}
                      initialBalance={backtest.stats["BALANCE INICIAL"]}
                      commission={backtest.config.COMISSION}
                  />
                </CardContent>
              </Card>

              {/* Strategy Configuration */}
              <StrategyConfigSection
                  config={backtest.config}
                  strategyConfig={backtest.strategy_config}
              />
            </div>

            {/* Stats Highlights - Spans 3 columns */}
            <div className="lg:col-span-3 space-y-4">
              <StatsHighlights
                  balance={backtest.stats["BALANCE"]}
                  profit={backtest.stats["P&L"]}
                  profitPercentage={Number.parseFloat(profitPercentage)}
                  winrate={backtest.stats["WINRATE"]}
                  initialBalance={backtest.stats["BALANCE INICIAL"]}
                  operations={backtest.stats["OPERACIONES"]}
                  trades={backtest.trades}
                  monthlyStats={backtest.monthly_stats}
                  startDate={backtest.config.INICIO}
                  endDate={backtest.config.FIN}
              />

              {/* Strategy Health */}
              <StrategyHealthCardComponent stats={backtest.stats} />
            </div>
          </div>

          {/* Trading Insights */}
          <TradingInsights
              bestDay={bestDay ? { day: bestDay.period, stats: bestDay.stats } : null}
              worstDay={worstDay ? { day: worstDay.period, stats: worstDay.stats } : null}
              bestHour={bestHour ? { hour: bestHour.period, stats: bestHour.stats } : null}
              worstHour={worstHour ? { hour: worstHour.period, stats: worstHour.stats } : null}
          />

          {/* Monthly Profitability Table */}
          <MonthlyProfitabilityTable monthlyStats={backtest.monthly_stats}/>
        </div>
    );
  } catch (error) {
    console.error('Error loading backtest:', error);
    notFound();
  }
}