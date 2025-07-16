export interface TradeImage {
  titulo: string
  imagen: string
}

export interface Trade {
  ORDEN: "BUY" | "SELL"
  RESULTADO: "TP" | "SL"
  ENTRADA: number
  SALIDA?: number
  TP?: number
  SL?: number
  HORA: string
  "P&L": number
  IMAGE?: TradeImage[] // Array of image objects
}

export interface BacktestConfig {
  STRATEGY: string
  INICIO: string
  FIN: string
  BALANCE: number
  VELAS: number
  SPREAD: number
  COMISSION: number
  SYMBOL: string
}

export interface StrategyConfig {
  "TRADING HOURS": string[][]
  DESCRIPTION: string
  TOPIC: string
  "EXCLUDED DAYS": string[]
  "LAST TRADE": number
  TFs: string[]
  RIESGO: number
  RR: number
}

export interface BacktestStats {
  "BALANCE INICIAL": number
  BALANCE: number
  "PEAK BALANCE": number
  "P&L": number
  COMISSION: number
  OPERACIONES: number
  GANADAS: number
  PERDIDAS: number
  WINRATE: number
  "WIN STREAK": number
  "LOSE STREAK": number
  MDD: number
  "SHARPE RATIO": number
  "PROFIT FACTOR": number
  "AVG WIN": number
  "AVG LOSS": number
  EXPECTANCY: number
}

export interface DayStats {
  TRADES: number
  WINS: number
  LOSSES: number
  WINRATE: number
  "P&L": number
  "AVG_P&L": number
}

export interface HourStats {
  TRADES: number
  WINS: number
  LOSSES: number
  WINRATE: number
  "P&L": number
  "AVG_P&L": number
}

export interface MonthlyStats {
  [year: string]: {
    [month: string]: number
  }
}

// New format from Python
export interface NewBacktestData {
  backtest_id: string
  metadata: {
    timestamp: string
    config: BacktestConfig
    strategy_config: StrategyConfig
  }
  statistics: {
    global: BacktestStats
    daily: {
      Monday: DayStats
      Tuesday: DayStats
      Wednesday: DayStats
      Thursday: DayStats
      Friday: DayStats
      Saturday: DayStats
      Sunday: DayStats
    }
    hourly: {
      [hour: string]: HourStats
    }
    monthly: MonthlyStats
  }
  trades: Trade[]
}

// Legacy format (current)
export interface BacktestData {
  config: BacktestConfig
  strategy_config: StrategyConfig
  stats: BacktestStats
  trades: Trade[]
  day_stats: {
    Monday: DayStats
    Tuesday: DayStats
    Wednesday: DayStats
    Thursday: DayStats
    Friday: DayStats
    Saturday: DayStats
    Sunday: DayStats
  }
  hour_stats: {
    [hour: string]: HourStats
  }
  monthly_stats: MonthlyStats
}
