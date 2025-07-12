"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MonthlyStats } from "@/lib/types"

interface MonthlyProfitabilityTableProps {
  monthlyStats: MonthlyStats
}

export function MonthlyProfitabilityTable({ monthlyStats }: MonthlyProfitabilityTableProps) {
  const [showAllYears, setShowAllYears] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

  // Meses en orden
  const monthOrder = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  // Años en orden descendente
  const years = Object.keys(monthlyStats).sort((a, b) => Number(b) - Number(a))

  // Determine which years to display
  const displayYears = selectedYear ? [selectedYear] : showAllYears ? years : years.slice(0, Math.min(5, years.length))

  // Calculate totals for displayed years only
  const displayYearlyTotals = displayYears.map((year) => {
    let total = 0
    monthOrder.forEach((month) => {
      const yearData = monthlyStats[year]
      total += yearData[month] || 0
    })
    return total.toFixed(2)
  })

  // Calcular totales por mes (para la última fila)
  const monthlyTotals = monthOrder.map((month) => {
    let total = 0
    years.forEach((year) => {
      const yearData = monthlyStats[year]
      total += yearData[month] || 0
    })
    return total.toFixed(2)
  })

  // Calcular totales por año (para la última columna)
  const yearlyTotals = years.map((year) => {
    let total = 0
    monthOrder.forEach((month) => {
      const yearData = monthlyStats[year]
      total += yearData[month] || 0
    })
    return total.toFixed(2)
  })

  // Calcular total general
  const grandTotal = yearlyTotals.reduce((sum, value) => sum + Number.parseFloat(value), 0).toFixed(2)

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Rentabilidad Mensual (%)
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAllYears(!showAllYears)} className="text-xs">
              {showAllYears ? "Mostrar menos" : `Ver todos (${years.length})`}
            </Button>
            {years.length > 5 && (
              <select
                value={selectedYear || "all"}
                onChange={(e) => setSelectedYear(e.target.value === "all" ? null : e.target.value)}
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
              📊 Mostrando últimos 5 años de {years.length} años totales.
              <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setShowAllYears(true)}>
                Ver todos los años
              </Button>
            </p>
          </div>
        )}

        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-20">
              <TableRow>
                <TableHead className="font-bold sticky left-0 bg-background z-30 border-r">Año</TableHead>
                {monthOrder.map((month) => (
                  <TableHead key={month} className="text-center min-w-[60px]">
                    {month}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold min-w-[80px] border-l">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayYears.map((year, yearIndex) => (
                <TableRow key={year} className="hover:bg-muted/50">
                  <TableCell className="font-bold sticky left-0 bg-background z-10 border-r">{year}</TableCell>
                  {monthOrder.map((month) => {
                    const value = monthlyStats[year][month] || 0
                    const isSignificant = Math.abs(value) > 0.1
                    return (
                      <TableCell
                        key={`${year}-${month}`}
                        className={`text-center text-sm ${
                          value > 0
                            ? isSignificant
                              ? "text-green-600 font-medium"
                              : "text-green-500"
                            : value < 0
                              ? isSignificant
                                ? "text-red-600 font-medium"
                                : "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {Math.abs(value) < 0.01 ? "—" : value.toFixed(1)}
                      </TableCell>
                    )
                  })}
                  <TableCell
                    className={`text-center font-bold text-sm border-l ${
                      Number.parseFloat(displayYearlyTotals[yearIndex]) > 0
                        ? "text-green-600"
                        : Number.parseFloat(displayYearlyTotals[yearIndex]) < 0
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {displayYearlyTotals[yearIndex]}
                  </TableCell>
                </TableRow>
              ))}

              {/* Fila de totales solo si se muestran múltiples años */}
              {displayYears.length > 1 && (
                <TableRow className="bg-muted/50 border-t-2 font-bold">
                  <TableCell className="font-bold sticky left-0 bg-muted/50 z-10 border-r">Promedio</TableCell>
                  {monthlyTotals.map((total, index) => {
                    const avgValue = Number.parseFloat(total) / displayYears.length
                    return (
                      <TableCell
                        key={`avg-${index}`}
                        className={`text-center font-bold text-sm ${
                          avgValue > 0 ? "text-green-600" : avgValue < 0 ? "text-red-600" : "text-muted-foreground"
                        }`}
                      >
                        {Math.abs(avgValue) < 0.01 ? "—" : avgValue.toFixed(1)}
                      </TableCell>
                    )
                  })}
                  <TableCell
                    className={`text-center font-bold text-sm border-l ${
                      Number.parseFloat(grandTotal) / displayYears.length > 0
                        ? "text-green-600"
                        : Number.parseFloat(grandTotal) / displayYears.length < 0
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {(Number.parseFloat(grandTotal) / displayYears.length).toFixed(1)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Resumen compacto para datasets grandes */}
        {years.length > 5 && (
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
                <div className={`font-medium ${Number.parseFloat(grandTotal) > 0 ? "text-green-600" : "text-red-600"}`}>
                  {grandTotal}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Promedio anual</div>
                <div
                  className={`font-medium ${Number.parseFloat(grandTotal) / years.length > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {(Number.parseFloat(grandTotal) / years.length).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
