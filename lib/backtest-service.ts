import fs from "fs"
import path from "path"
import type { BacktestData, NewBacktestData } from "./types"

// Directory to store backtest data
const DATA_DIR = path.join(process.cwd(), "data")

// Ensure the data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Get the file path for a backtest ID
const getBacktestFilePath = (id: string) => {
  return path.join(DATA_DIR, `${id}.json`)
}

function convertNewToLegacy(newData: NewBacktestData): BacktestData {

  return {
    config: newData.metadata.config,
    strategy_config: newData.metadata.strategy_config,
    stats: newData.statistics.global,
    day_stats: newData.statistics.daily,
    hour_stats: newData.statistics.hourly,
    monthly_stats: newData.statistics.monthly,
    trades: newData.trades,
  }
}

// Save backtest data to a file
export async function saveBacktest(id: string, data: NewBacktestData | BacktestData): Promise<void> {
  console.log(`💾 Saving backtest ${id}`)

  ensureDataDir()
  const filePath = getBacktestFilePath(id)

  // Check if it's new format or legacy format
  if ("backtest_id" in data) {
    // It's new format, save as is
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
  } else {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
  }

  console.log(`✅ Backtest ${id} saved successfully`)
}

// Get backtest data from a file
export async function getBacktest(id: string): Promise<BacktestData> {
  const filePath = getBacktestFilePath(id)

  try {
    const data = await fs.promises.readFile(filePath, "utf-8")
    const parsedData = JSON.parse(data)

    console.log(`📖 Loading backtest ${id}`)

    // Check if it's new format
    if ("backtest_id" in parsedData) {
      return convertNewToLegacy(parsedData as NewBacktestData)
    } else {
      return parsedData as BacktestData
    }
  } catch (error) {
    console.log(`❌ Error loading backtest ${id}:`, error)

    // For demo purposes, if the file doesn't exist and the ID is "demo", return demo data
    if (id === "demo") {
      return getDemoBacktestData()
    }

    throw new Error(`Backtest with ID ${id} not found`)
  }
}

// Validate backtest data structure (updated for both formats)
export function isValidBacktestData(data: any): boolean {

  try {
    // Check if it's new format
    if ("backtest_id" in data) {
      const isValid =
        data &&
        typeof data === "object" &&
        data.backtest_id &&
        data.metadata &&
        data.metadata.config &&
        data.metadata.strategy_config &&
        data.statistics &&
        data.statistics.global &&
        data.statistics.daily &&
        data.statistics.hourly &&
        data.statistics.monthly &&
        Array.isArray(data.trades)

      if (!isValid) {
        console.log("❌ New format validation failed:", {
          hasBacktestId: !!data?.backtest_id,
          hasMetadata: !!data?.metadata,
          hasConfig: !!data?.metadata?.config,
          hasStrategyConfig: !!data?.metadata?.strategy_config,
          hasStatistics: !!data?.statistics,
          hasGlobalStats: !!data?.statistics?.global,
          hasDailyStats: !!data?.statistics?.daily,
          hasHourlyStats: !!data?.statistics?.hourly,
          hasMonthlyStats: !!data?.statistics?.monthly,
          hasTrades: Array.isArray(data?.trades),
        })
      }

      return isValid
    } else {
      // Legacy format validation
      const isValid =
        data &&
        typeof data === "object" &&
        data.config &&
        data.strategy_config &&
        data.stats &&
        data.day_stats &&
        data.hour_stats &&
        data.monthly_stats &&
        Array.isArray(data.trades)

      if (!isValid) {
        console.log("❌ Legacy format validation failed:", {
          hasConfig: !!data?.config,
          hasStrategyConfig: !!data?.strategy_config,
          hasStats: !!data?.stats,
          hasDayStats: !!data?.day_stats,
          hasHourStats: !!data?.hour_stats,
          hasMonthlyStats: !!data?.monthly_stats,
          hasTrades: Array.isArray(data?.trades),
        })
      }

      return isValid
    }
  } catch (error) {
    console.error("❌ Error validating data:", error)
    return false
  }
}

// Generate demo backtest data using the exact structure from the JSON you provided
function getDemoBacktestData(): BacktestData {
  return {
    config: {
      STRATEGY: "SIMPLE_SMC",
      INICIO: "2024-01-01",
      FIN: "2024-08-21",
      BALANCE: 5000,
      VELAS: 150,
      SPREAD: 0.0001,
      COMISSION: 2,
      SYMBOL: "EURUSD",
    },
    strategy_config: {
      "TRADING HOURS": [
        ["06:00:00", "11:00:00"],
        ["15:00:00", "17:00:00"],
      ],
      DESCRIPTION: "Test",
      TOPIC: "TEST",
      "EXCLUDED DAYS": [],
      "LAST TRADE": 30,
      TFs: ["M30", "M5"],
      RIESGO: 0.01,
      RR: 1,
    },
    stats: {
      "BALANCE INICIAL": 5000,
      BALANCE: 5428,
      "PEAK BALANCE": 5696,
      "P&L": 428,
      COMISSION: 122,
      OPERACIONES: 61,
      GANADAS: 36,
      PERDIDAS: 25,
      WINRATE: 59.01639344262295,
      "WIN STREAK": 11,
      "LOSE STREAK": 5,
      MDD: 7.790103311408629,
      "SHARPE RATIO": 1.420093893609386,
      "PROFIT FACTOR": 1.44,
      "AVG WIN": 50,
      "AVG LOSS": -50,
      EXPECTANCY: 9.016393442622949,
    },
    day_stats: {
      Monday: {
        TRADES: 12,
        WINS: 5,
        LOSSES: 7,
        WINRATE: 41.66666666666667,
        "P&L": -100,
        "AVG_P&L": -8.333333333333334,
      },
      Tuesday: {
        TRADES: 12,
        WINS: 6,
        LOSSES: 6,
        WINRATE: 50,
        "P&L": 0,
        "AVG_P&L": 0,
      },
      Wednesday: {
        TRADES: 10,
        WINS: 7,
        LOSSES: 3,
        WINRATE: 70,
        "P&L": 200,
        "AVG_P&L": 20,
      },
      Thursday: {
        TRADES: 9,
        WINS: 6,
        LOSSES: 3,
        WINRATE: 66.66666666666666,
        "P&L": 150,
        "AVG_P&L": 16.666666666666668,
      },
      Friday: {
        TRADES: 18,
        WINS: 12,
        LOSSES: 6,
        WINRATE: 66.66666666666666,
        "P&L": 300,
        "AVG_P&L": 16.666666666666668,
      },
      Saturday: {
        TRADES: 0,
        WINS: 0,
        LOSSES: 0,
        WINRATE: 0,
        "P&L": 0,
        "AVG_P&L": 0,
      },
      Sunday: {
        TRADES: 0,
        WINS: 0,
        LOSSES: 0,
        WINRATE: 0,
        "P&L": 0,
        "AVG_P&L": 0,
      },
    },
    hour_stats: {
      "0": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "1": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "2": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "3": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "4": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "5": { TRADES: 11, WINS: 6, LOSSES: 5, WINRATE: 54.54545454545454, "P&L": 50, "AVG_P&L": 4.545454545454546 },
      "6": { TRADES: 9, WINS: 5, LOSSES: 4, WINRATE: 55.55555555555556, "P&L": 50, "AVG_P&L": 5.555555555555555 },
      "7": { TRADES: 4, WINS: 3, LOSSES: 1, WINRATE: 75, "P&L": 100, "AVG_P&L": 25 },
      "8": { TRADES: 5, WINS: 4, LOSSES: 1, WINRATE: 80, "P&L": 150, "AVG_P&L": 30 },
      "9": { TRADES: 5, WINS: 2, LOSSES: 3, WINRATE: 40, "P&L": -50, "AVG_P&L": -10 },
      "10": { TRADES: 5, WINS: 2, LOSSES: 3, WINRATE: 40, "P&L": -50, "AVG_P&L": -10 },
      "11": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "12": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "13": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "14": { TRADES: 10, WINS: 4, LOSSES: 6, WINRATE: 40, "P&L": -100, "AVG_P&L": -10 },
      "15": { TRADES: 5, WINS: 4, LOSSES: 1, WINRATE: 80, "P&L": 150, "AVG_P&L": 30 },
      "16": { TRADES: 7, WINS: 6, LOSSES: 1, WINRATE: 85.71428571428571, "P&L": 250, "AVG_P&L": 35.714285714285715 },
      "17": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "18": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "19": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "20": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "21": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "22": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
      "23": { TRADES: 0, WINS: 0, LOSSES: 0, WINRATE: 0, "P&L": 0, "AVG_P&L": 0 },
    },
    monthly_stats: {
      "2024": {
        Ene: 4,
        Feb: 7,
        Mar: -1,
        Abr: 0,
        May: -1,
        Jun: -2,
        Jul: 2,
        Ago: 2,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dic: 0,
      },
    },
    trades: generateDemoTrades(),
  }
}

// Generate demo trades that match the final balance
function generateDemoTrades(): any[] {
  const trades = []
  const startDate = new Date("2024-01-01")
  const endDate = new Date("2024-08-21")

  // Days of the week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  // Trading hours
  const tradingHours = [5, 6, 7, 8, 9, 10, 14, 15, 16]

  // Generate 61 trades that sum to 428 P&L (36 wins * 50 - 25 losses * 50 = 1800 - 1250 = 550, minus 122 commission = 428)
  for (let i = 0; i < 61; i++) {
    // Random date between start and end
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))

    // Ensure it's a weekday
    while (randomDate.getDay() === 0 || randomDate.getDay() === 6) {
      randomDate.setDate(randomDate.getDate() + 1)
    }

    // Random hour from trading hours
    const hourOfDay = tradingHours[Math.floor(Math.random() * tradingHours.length)]
    randomDate.setHours(hourOfDay, Math.floor(Math.random() * 60), 0)

    // Random order type
    const orderType = Math.random() > 0.5 ? "BUY" : "SELL"

    // Determine result based on exact win/loss count (36 wins, 25 losses)
    const isWin = i < 36
    const result = isWin ? "TP" : "SL"

    // Random entry price around 1.09
    const entryPrice = 1.09 + (Math.random() * 0.02 - 0.01)

    // Calculate TP and SL based on order type
    let tp, sl
    if (orderType === "BUY") {
      tp = entryPrice + 0.001
      sl = entryPrice - 0.001
    } else {
      tp = entryPrice - 0.001
      sl = entryPrice + 0.001
    }

    // P&L based on result (50 for win, -50 for loss, -2 commission per trade)
    const pnl = isWin ? 50 - 2 : -50 - 2

    trades.push({
      ORDEN: orderType,
      RESULTADO: result,
      ENTRADA: Number.parseFloat(entryPrice.toFixed(4)),
      TP: Number.parseFloat(tp.toFixed(4)),
      SL: Number.parseFloat(sl.toFixed(4)),
      HORA: randomDate.toISOString(),
      "P&L": pnl,
      DAY_OF_WEEK: daysOfWeek[randomDate.getDay() - 1],
      HOUR_OF_DAY: hourOfDay,
    })
  }

  // Sort trades by date
  return trades.sort((a, b) => new Date(a.HORA).getTime() - new Date(b.HORA).getTime())
}
