"use client"

import { useState, useMemo } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parse,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Trade } from "@/lib/types"

interface TradesCalendarProps {
  trades: Trade[]
  startDate: string
  compact?: boolean
}

export function TradesCalendar({ trades, startDate, compact = false }: TradesCalendarProps) {
  // Inicializar con la fecha de inicio del backtest
  const initialDate = parse(startDate, "yyyy-MM-dd", new Date())
  const [currentMonth, setCurrentMonth] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Usar useMemo para calcular tradesByDate solo cuando trades cambie
  const tradesByDate = useMemo(() => {
    return trades.reduce((acc: Record<string, Trade[]>, trade) => {
      const dateKey = format(new Date(trade.HORA), "yyyy-MM-dd")
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(trade)
      return acc
    }, {})
  }, [trades])

  // Usar useMemo para calcular selectedTrades solo cuando selectedDate o tradesByDate cambien
  const selectedTrades = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return tradesByDate[dateKey] || []
  }, [selectedDate, tradesByDate])

  // Navegar al mes anterior
  const prevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  // Navegar al mes siguiente
  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  // Calcular datos del calendario
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const weekDays = compact ? ["L", "M", "X", "J", "V", "S", "D"] : ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  const firstDayOfMonth = (monthStart.getDay() + 6) % 7

  // Función para obtener el resumen de operaciones para un día específico
  const getDaySummary = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dayTrades = tradesByDate[dateKey] || []

    if (dayTrades.length === 0) return null

    const wins = dayTrades.filter((trade) => trade.RESULTADO === "TP").length
    const losses = dayTrades.filter((trade) => trade.RESULTADO === "SL").length
    const pnl = dayTrades.reduce((sum, trade) => sum + trade["P&L"], 0)

    return { total: dayTrades.length, wins, losses, pnl }
  }

  return (
    <div className="space-y-2">
      {/* Controles del calendario */}
      <div className="flex justify-between items-center mb-2">
        <Button variant="outline" size="icon" onClick={prevMonth} className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className={`font-bold capitalize ${compact ? "text-sm" : "text-lg"}`}>
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth} className="h-7 w-7">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendario */}
      <div className="rounded-lg border overflow-hidden">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((day) => (
            <div key={day} className={`${compact ? "p-1" : "p-2"} text-center font-medium text-xs`}>
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {/* Espacios vacíos para alinear el primer día del mes */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className={`${compact ? "p-1 h-8" : "p-2 h-12"} border-t border-r`}></div>
          ))}

          {/* Días del mes */}
          {daysInMonth.map((day) => {
            const daySummary = getDaySummary(day)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <div
                key={format(day, "yyyy-MM-dd")}
                className={`${compact ? "p-1 h-8" : "p-2 h-12"} border-t border-r relative ${
                  !isSameMonth(day, currentMonth) ? "bg-muted/50" : ""
                } ${isSelected ? "bg-primary/10" : ""} hover:bg-muted/30 cursor-pointer transition-colors`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`inline-flex ${compact ? "h-5 w-5 text-xs" : "h-6 w-6 text-sm"} items-center justify-center rounded-full ${
                      isToday ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  {daySummary && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={daySummary.pnl >= 0 ? "default" : "destructive"}
                            className={`text-xs ${compact ? "px-1 py-0 text-[10px]" : ""}`}
                          >
                            {daySummary.total}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <div>Operaciones: {daySummary.total}</div>
                            <div>Ganadas: {daySummary.wins}</div>
                            <div>Perdidas: {daySummary.losses}</div>
                            <div className={daySummary.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                              P&L: €{daySummary.pnl.toFixed(2)}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {/* Indicadores de operaciones (más pequeños en modo compacto) */}
                {daySummary && !compact && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {daySummary.wins > 0 && (
                      <div
                        className="h-1.5 rounded-full bg-green-500"
                        style={{ width: `${Math.min(daySummary.wins * 10, 100)}%` }}
                      ></div>
                    )}
                    {daySummary.losses > 0 && (
                      <div
                        className="h-1.5 rounded-full bg-red-500"
                        style={{ width: `${Math.min(daySummary.losses * 10, 100)}%` }}
                      ></div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Operaciones del día seleccionado (solo si hay una fecha seleccionada) */}
      {selectedDate && selectedTrades.length > 0 && (
        <div className="mt-2 border rounded-lg p-2 bg-muted/10 text-xs">
          <div className="font-medium mb-1">
            {format(selectedDate, "d MMM", { locale: es })}: {selectedTrades.length} operaciones
          </div>
          <div className="flex justify-between">
            <span>
              {selectedTrades.filter((t) => t.RESULTADO === "TP").length} ganadas /
              {selectedTrades.filter((t) => t.RESULTADO === "SL").length} perdidas
            </span>
            <span
              className={selectedTrades.reduce((sum, t) => sum + t["P&L"], 0) >= 0 ? "text-green-500" : "text-red-500"}
            >
              €{selectedTrades.reduce((sum, t) => sum + t["P&L"], 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
