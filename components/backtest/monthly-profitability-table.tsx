"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MonthlyStats } from "@/lib/types"

interface MonthlyProfitabilityTableProps {
  monthlyStats: MonthlyStats
}

const MONTH_ORDER = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] as const
const DEFAULT_YEARS_TO_SHOW = 5

export function MonthlyProfitabilityTable({ monthlyStats }: MonthlyProfitabilityTableProps) {
  const [showAllYears, setShowAllYears] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

  // Memoizar cálculos pesados
  const { years, yearlyTotals, monthlyTotals, grandTotal } = useMemo(() => {
    const yearList = Object.keys(monthlyStats).sort((a, b) => Number(b) - Number(a))

    // Calcular totales por año
    const yearTotals = yearList.map(year => {
      const total = MONTH_ORDER.reduce((sum, month) => sum + (monthlyStats[year]?.[month] || 0), 0)
      return Number(total.toFixed(2))
    })

    // Calcular totales por mes
    const monthTotals = MONTH_ORDER.map(month => {
      const total = yearList.reduce((sum, year) => sum + (monthlyStats[year]?.[month] || 0), 0)
      return Number(total.toFixed(2))
    })

    // Total general
    const total = yearTotals.reduce((sum, value) => sum + value, 0)

    return {
      years: yearList,
      yearlyTotals: yearTotals,
      monthlyTotals: monthTotals,
      grandTotal: Number(total.toFixed(2))
    }
  }, [monthlyStats])

  // Años a mostrar
  const displayYears = useMemo(() => {
    if (selectedYear) return [selectedYear]
    if (showAllYears) return years
    return years.slice(0, Math.min(DEFAULT_YEARS_TO_SHOW, years.length))
  }, [selectedYear, showAllYears, years])

  // Totales para años mostrados
  const displayYearlyTotals = useMemo(() => {
    return displayYears.map(year => {
      const yearIndex = years.indexOf(year)
      return yearlyTotals[yearIndex]
    })
  }, [displayYears, years, yearlyTotals])

  // Calcular promedios para múltiples años
  const averages = useMemo(() => {
    if (displayYears.length <= 1) return null

    const monthlyAvgs = monthlyTotals.map(total => Number((total / displayYears.length).toFixed(2)))
    const yearlyAvg = Number((grandTotal / displayYears.length).toFixed(2))

    return { monthlyAvgs, yearlyAvg }
  }, [displayYears.length, monthlyTotals, grandTotal])

  // Funciones helper
  const formatValue = (value: number): string => {
    return Math.abs(value) < 0.01 ? "—" : value.toFixed(1)
  }

  const getValueClassName = (value: number, isSignificant = true): string => {
    if (Math.abs(value) < 0.01) return "text-muted-foreground"

    const intensity = isSignificant && Math.abs(value) > 0.1 ? "font-medium" : ""
    const color = value > 0 ? "text-green-600" : "text-red-600"

    return `${color} ${intensity}`.trim()
  }

  const toggleYearView = () => {
    setShowAllYears(!showAllYears)
    setSelectedYear(null)
  }

  const handleYearSelect = (year: string) => {
    setSelectedYear(year === "all" ? null : year)
    setShowAllYears(false)
  }

  return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Rentabilidad Mensual (%)
            <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleYearView}
                  className="text-xs"
              >
                {showAllYears ? "Mostrar menos" : `Ver todos (${years.length})`}
              </Button>
              {years.length > DEFAULT_YEARS_TO_SHOW && (
                  <select
                      value={selectedYear || "all"}
                      onChange={(e) => handleYearSelect(e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                  >
                    <option value="all">Todos los años</option>
                    {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                    ))}
                  </select>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {years.length > 10 && !showAllYears && !selectedYear && (
              <div className="p-4 bg-muted/30 border-b">
                <p className="text-sm text-muted-foreground">
                  📊 Mostrando últimos {DEFAULT_YEARS_TO_SHOW} años de {years.length} años totales.
                  <Button
                      variant="link"
                      className="p-0 h-auto text-sm ml-1"
                      onClick={toggleYearView}
                  >
                    Ver todos los años
                  </Button>
                </p>
              </div>
          )}

          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-20">
                <TableRow>
                  <TableHead className="font-bold sticky left-0 bg-background z-30 border-r">
                    Año
                  </TableHead>
                  {MONTH_ORDER.map((month) => (
                      <TableHead key={month} className="text-center min-w-[60px]">
                        {month}
                      </TableHead>
                  ))}
                  <TableHead className="text-center font-bold min-w-[80px] border-l">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayYears.map((year, yearIndex) => (
                    <TableRow key={year} className="hover:bg-muted/50">
                      <TableCell className="font-bold sticky left-0 bg-background z-10 border-r">
                        {year}
                      </TableCell>
                      {MONTH_ORDER.map((month) => {
                        const value = monthlyStats[year]?.[month] || 0
                        return (
                            <TableCell
                                key={`${year}-${month}`}
                                className={`text-center text-sm ${getValueClassName(value, Math.abs(value) > 0.1)}`}
                            >
                              {formatValue(value)}
                            </TableCell>
                        )
                      })}
                      <TableCell
                          className={`text-center font-bold text-sm border-l ${getValueClassName(displayYearlyTotals[yearIndex])}`}
                      >
                        {displayYearlyTotals[yearIndex].toFixed(1)}
                      </TableCell>
                    </TableRow>
                ))}

                {/* Fila de promedios para múltiples años */}
                {averages && (
                    <TableRow className="bg-muted/50 border-t-2 font-bold">
                      <TableCell className="font-bold sticky left-0 bg-muted/50 z-10 border-r">
                        Promedio
                      </TableCell>
                      {averages.monthlyAvgs.map((avg, index) => (
                          <TableCell
                              key={`avg-${index}`}
                              className={`text-center font-bold text-sm ${getValueClassName(avg)}`}
                          >
                            {formatValue(avg)}
                          </TableCell>
                      ))}
                      <TableCell
                          className={`text-center font-bold text-sm border-l ${getValueClassName(averages.yearlyAvg)}`}
                      >
                        {averages.yearlyAvg.toFixed(1)}
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Resumen para datasets grandes */}
          {years.length > DEFAULT_YEARS_TO_SHOW && (
              <div className="p-4 bg-muted/20 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Período</div>
                    <div className="font-medium">
                      {years[years.length - 1]} - {years[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Años totales</div>
                    <div className="font-medium">{years.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Rentabilidad total</div>
                    <div className={`font-medium ${getValueClassName(grandTotal)}`}>
                      {grandTotal.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Promedio anual</div>
                    <div className={`font-medium ${getValueClassName(grandTotal / years.length)}`}>
                      {(grandTotal / years.length).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
          )}
        </CardContent>
      </Card>
  )
}