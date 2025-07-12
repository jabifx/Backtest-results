"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  X,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"
import type { Trade } from "@/lib/types"

interface EnhancedTradesTableProps {
  trades: Trade[]
  backtestId: string
}

export function EnhancedTradesTable({ trades, backtestId }: EnhancedTradesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [resultFilter, setResultFilter] = useState<string>("all")
  const [orderFilter, setOrderFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Filter trades based on all criteria
  const filteredTrades = useMemo(() => {
    return trades.filter((trade, index) => {
      const matchesSearch =
        searchTerm === "" ||
        (index + 1).toString().includes(searchTerm) ||
        trade.ORDEN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.RESULTADO.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesResult = resultFilter === "all" || trade.RESULTADO === resultFilter
      const matchesOrder = orderFilter === "all" || trade.ORDEN === orderFilter

      const tradeDate = new Date(trade.HORA).toISOString().split("T")[0]
      const matchesDateFrom = !dateFrom || tradeDate >= dateFrom
      const matchesDateTo = !dateTo || tradeDate <= dateTo

      return matchesSearch && matchesResult && matchesOrder && matchesDateFrom && matchesDateTo
    })
  }, [trades, searchTerm, resultFilter, orderFilter, dateFrom, dateTo])

  // Pagination logic
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTrades = filteredTrades.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setResultFilter("all")
    setOrderFilter("all")
    setDateFrom("")
    setDateTo("")
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || resultFilter !== "all" || orderFilter !== "all" || dateFrom || dateTo

  // Pagination component
  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>,
      )
    }

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a {Math.min(endIndex, filteredTrades.length)} de {filteredTrades.length} trades
          {filteredTrades.length !== trades.length && ` (filtrados de ${trades.length} totales)`}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pages}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Historial de Operaciones
        </CardTitle>
        <CardDescription>Explora y filtra todas las operaciones del backtest</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar trades..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                handleFilterChange()
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={resultFilter}
            onValueChange={(value) => {
              setResultFilter(value)
              handleFilterChange()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Resultado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los resultados</SelectItem>
              <SelectItem value="TP">Take Profit</SelectItem>
              <SelectItem value="SL">Stop Loss</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={orderFilter}
            onValueChange={(value) => {
              setOrderFilter(value)
              handleFilterChange()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Dirección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las direcciones</SelectItem>
              <SelectItem value="BUY">Compra</SelectItem>
              <SelectItem value="SELL">Venta</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            placeholder="Desde"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              handleFilterChange()
            }}
          />

          <Input
            type="date"
            placeholder="Hasta"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              handleFilterChange()
            }}
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Items per page selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">por página</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {hasActiveFilters
                      ? "No se encontraron trades con los filtros aplicados"
                      : "No hay trades disponibles"}
                  </TableCell>
                </TableRow>
              ) : (
                currentTrades.map((trade, index) => {
                  const originalIndex = trades.indexOf(trade)
                  const tradeDate = new Date(trade.HORA)

                  return (
                    <TableRow key={originalIndex}>
                      <TableCell className="font-medium">{originalIndex + 1}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{tradeDate.toLocaleDateString("es-ES")}</div>
                          <div className="text-xs text-muted-foreground">
                            {tradeDate.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trade.ORDEN === "BUY" ? "default" : "secondary"} className="gap-1">
                          {trade.ORDEN === "BUY" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {trade.ORDEN}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{trade.ENTRADA.toFixed(5)}</TableCell>
                      <TableCell>
                        <Badge variant={trade.RESULTADO === "TP" ? "default" : "destructive"}>
                          {trade.RESULTADO === "TP" ? "✅ TP" : "❌ SL"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${trade["P&L"] >= 0 ? "text-green-600" : "text-red-600"}`}>
                          €{trade["P&L"].toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/backtest/${backtestId}/trades/${originalIndex}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </CardContent>
    </Card>
  )
}
