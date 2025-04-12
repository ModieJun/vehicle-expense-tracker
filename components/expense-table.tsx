"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ArrowUpDown, Copy, MoreHorizontal, Trash2 } from "lucide-react"

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
import { deleteExpenses, duplicateExpenses, getExpenses } from "@/app/actions/expense-actions"
import { useToast } from "@/hooks/use-toast"
import { Expense } from "@/lib/prisma-fe-types"


export function ExpenseTable() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()


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
      if (typeFilter !== "all" && expense.type !== typeFilter) {
        return false
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          expense.description?.toLowerCase().includes(searchLower) ||
          false ||
          expense.type.toLowerCase().includes(searchLower)
        )
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
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="parking">Parking</SelectItem>
            <SelectItem value="violation">Traffic Violations</SelectItem>
            <SelectItem value="gasoline">Gasoline</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  data-state={selectedRows.length === filteredData.length && filteredData.length > 0?"checked":"indeterminate"}
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
                  No expenses found.
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
                  <TableCell>{formatType(expense.type)}</TableCell>
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
