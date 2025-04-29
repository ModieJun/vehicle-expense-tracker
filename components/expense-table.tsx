"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ArrowUpDown, Copy, MoreHorizontal, Trash2, Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteExpenses, duplicateExpenses, getExpenses } from "@/app/actions/expense-actions"
import { useToast } from "@/hooks/use-toast"
import type { Expense } from "@/lib/prisma-fe-types"

interface FilterState {
  searchTerm: string
  typeFilter: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  amountMin: string
  amountMax: string
}

export function ExpenseTable() {
  const [mounted, setMounted] = useState(false)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    typeFilter: "all",
    dateFrom: undefined,
    dateTo: undefined,
    amountMin: "",
    amountMax: "",
  })

  // Fetch expenses
  useEffect(() => {
    async function fetchExpenses() {
      setIsLoading(true)
      try {
        const result = await getExpenses()
        if (result.success && result.data) {
          setExpenses(result.data)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to fetch expenses",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenses()
  }, [toast])

  // Ensure component is mounted before rendering charts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Filter and sort data
  const filteredData = expenses
    .filter((expense) => {
      // Apply type filter
      if (filters.typeFilter !== "all" && expense.type !== filters.typeFilter) {
        return false
      }

      // Apply search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        if (
          !expense.description?.toLowerCase().includes(searchLower) &&
          !expense.type.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Apply date range filter
      if (filters.dateFrom) {
        const expenseDate = new Date(expense.date)
        const fromDate = new Date(filters.dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        if (expenseDate < fromDate) {
          return false
        }
      }

      if (filters.dateTo) {
        const expenseDate = new Date(expense.date)
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (expenseDate > toDate) {
          return false
        }
      }

      // Apply amount range filter
      if (filters.amountMin && expense.amount < Number.parseFloat(filters.amountMin)) {
        return false
      }

      if (filters.amountMax && expense.amount > Number.parseFloat(filters.amountMax)) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

  // Format expense type for display
  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  // Handle "select all" checkbox
  const toggleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredData.map((expense) => expense.id))
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      typeFilter: "all",
      dateFrom: undefined,
      dateTo: undefined,
      amountMin: "",
      amountMax: "",
    })
  }

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchTerm ||
    filters.typeFilter !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.amountMin ||
    filters.amountMax

  // Duplicate selected expenses
  const handleDuplicateSelected = async () => {
    try {
      const result = await duplicateExpenses(selectedRows)
      if (result.success) {
        toast({
          title: "Success",
          description: `${selectedRows.length} expense(s) duplicated successfully`,
        })
        // Refresh expenses
        const refreshResult = await getExpenses()
        if (refreshResult.success) {
          setExpenses(refreshResult.data)
        }
        setSelectedRows([]) // Clear selection after duplication
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to duplicate expenses",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Delete selected expenses
  const handleDeleteSelected = async () => {
    try {
      const result = await deleteExpenses(selectedRows)
      if (result.success) {
        toast({
          title: "Success",
          description: `${selectedRows.length} expense(s) deleted successfully`,
        })
        // Refresh expenses
        const refreshResult = await getExpenses()
        if (refreshResult.success) {
          setExpenses(refreshResult.data)
        }
        setSelectedRows([]) // Clear selection after deletion
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete expenses",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
    setIsDeleteDialogOpen(false)
  }

  // Handle single expense deletion
  const handleDeleteSingle = async (id: string) => {
    try {
      const result = await deleteExpenses([id])
      if (result.success) {
        toast({
          title: "Success",
          description: "Expense deleted successfully",
        })
        // Refresh expenses
        const refreshResult = await getExpenses()
        if (refreshResult.success) {
          setExpenses(refreshResult.data)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete expense",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Handle single expense duplication
  const handleDuplicateSingle = async (id: string) => {
    try {
      const result = await duplicateExpenses([id])
      if (result.success) {
        toast({
          title: "Success",
          description: "Expense duplicated successfully",
        })
        // Refresh expenses
        const refreshResult = await getExpenses()
        if (refreshResult.success) {
          setExpenses(refreshResult.data)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to duplicate expense",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search expenses..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.typeFilter}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, typeFilter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="violation">Traffic Violations</SelectItem>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="toll">Toll</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters((prev) => ({ ...prev, dateFrom: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters((prev) => ({ ...prev, dateTo: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Amount Min */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={filters.amountMin}
                    onChange={(e) => setFilters((prev) => ({ ...prev, amountMin: e.target.value }))}
                  />
                </div>
              </div>

              {/* Amount Max */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={filters.amountMax}
                    onChange={(e) => setFilters((prev) => ({ ...prev, amountMax: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm font-medium">Active filters:</span>
                {filters.searchTerm && (
                  <Badge variant="secondary">
                    Search: {filters.searchTerm}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, searchTerm: "" }))}
                    />
                  </Badge>
                )}
                {filters.typeFilter !== "all" && (
                  <Badge variant="secondary">
                    Type: {formatType(filters.typeFilter)}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, typeFilter: "all" }))}
                    />
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary">
                    From: {format(filters.dateFrom, "MMM d, yyyy")}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, dateFrom: undefined }))}
                    />
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary">
                    To: {format(filters.dateTo, "MMM d, yyyy")}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, dateTo: undefined }))}
                    />
                  </Badge>
                )}
                {filters.amountMin && (
                  <Badge variant="secondary">
                    Min: ${filters.amountMin}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, amountMin: "" }))}
                    />
                  </Badge>
                )}
                {filters.amountMax && (
                  <Badge variant="secondary">
                    Max: ${filters.amountMax}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, amountMax: "" }))}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredData.length} of {expenses.length} expenses
          {hasActiveFilters && " (filtered)"}
        </span>
        {filteredData.length > 0 && (
          <span>Total: ${filteredData.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</span>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
          <span className="text-sm font-medium">{selectedRows.length} selected</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={handleDuplicateSelected}>
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex items-center gap-1"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  data-state={
                    selectedRows.length === filteredData.length && filteredData.length > 0 ? "checked" : "indeterminate"
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                  disabled={isLoading || filteredData.length === 0}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  className="flex items-center gap-1 p-0 font-medium"
                >
                  Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden sm:table-cell">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading expenses...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {hasActiveFilters ? "No expenses match your filters." : "No expenses found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((expense) => (
                <TableRow key={expense.id} className={selectedRows.includes(expense.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(expense.id)}
                      onCheckedChange={() => toggleRowSelection(expense.id)}
                      aria-label={`Select expense ${expense.description || ""}`}
                    />
                  </TableCell>
                  <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatType(expense.type)}</Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate sm:table-cell">
                    {expense.description || ""}
                  </TableCell>
                  <TableCell className="text-right font-medium">${Number(expense.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleDuplicateSingle(expense.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSingle(expense.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog for Bulk Delete */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedRows.length} expense{selectedRows.length > 1 ? "s" : ""}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
