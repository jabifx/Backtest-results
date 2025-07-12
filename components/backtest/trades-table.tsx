"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Search } from "lucide-react"
import type { Trade } from "@/lib/types"

interface TradesTableProps {
  trades: Trade[]
}

type SortField = "HORA" | "ORDEN" | "RESULTADO" | "ENTRADA" | "TP" | "SL" | "P&L" | "DAY_OF_WEEK" | "HOUR_OF_DAY"
type SortDirection = "asc" | "desc"

export function TradesTable({ trades }: TradesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortField, setSortField] = useState<SortField>("HORA")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [orderFilter, setOrderFilter] = useState<string>("all")
  const [resultFilter, setResultFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Filter trades based on selected filters
  const filteredTrades = trades.filter((trade) => {
    // Apply order filter
    if (orderFilter !== "all" && trade.ORDEN !== orderFilter) {
      return false
    }

    // Apply result filter
    if (resultFilter !== "all" && trade.RESULTADO !== resultFilter) {
      return false
    }

    // Apply search query (search by date)
    if (searchQuery) {
      const date = new Date(trade.HORA).toISOString().split("T")[0]
      return date.includes(searchQuery)
    }

    return true
  })

  // Sort trades based on selected field and direction
  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Special handling for date sorting
    if (sortField === "HORA") {
      aValue = new Date(a.HORA).getTime()
      bValue = new Date(b.HORA).getTime()
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedTrades.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedTrades = sortedTrades.slice(startIndex, startIndex + pageSize)

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Trades History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="TP">Take Profit</SelectItem>
                <SelectItem value="SL">Stop Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              placeholder="Search by date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[180px]"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("HORA")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("ORDEN")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Order
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("RESULTADO")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Result
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("ENTRADA")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Entry
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("TP")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    TP
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("SL")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    SL
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("P&L")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    P&L
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("DAY_OF_WEEK")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Day
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("HOUR_OF_DAY")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Hour
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTrades.length > 0 ? (
                paginatedTrades.map((trade, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                    <TableCell>{formatDate(trade.HORA)}</TableCell>
                    <TableCell
                      className={
                        trade.ORDEN === "BUY" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }
                    >
                      {trade.ORDEN}
                    </TableCell>
                    <TableCell
                      className={
                        trade.RESULTADO === "TP"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {trade.RESULTADO}
                    </TableCell>
                    <TableCell>{trade.ENTRADA}</TableCell>
                    <TableCell>{trade.TP}</TableCell>
                    <TableCell>{trade.SL}</TableCell>
                    <TableCell
                      className={
                        trade["P&L"] >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }
                    >
                      €{trade["P&L"].toFixed(2)}
                    </TableCell>
                    <TableCell>{trade.DAY_OF_WEEK}</TableCell>
                    <TableCell>{trade.HOUR_OF_DAY}:00</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No trades found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedTrades.length)} of{" "}
              {sortedTrades.length} trades
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm mx-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
