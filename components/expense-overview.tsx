"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getExpenses } from "@/app/actions/expense-actions"
import { useToast } from "@/hooks/use-toast"
import type { Expense } from "@prisma/client"

export function ExpenseOverview() {
  const [mounted, setMounted] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch expenses
  useEffect(() => {
    async function fetchExpenses() {
      setIsLoading(true)
      try {
        const result = await getExpenses()
        if (result.success) {
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

  // Calculate totals
  const totalParking = expenses
    .filter((expense) => expense.type === "parking")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  const totalViolations = expenses
    .filter((expense) => expense.type === "violation")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  const totalGasoline = expenses
    .filter((expense) => expense.type === "gasoline")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  const totalMaintenance = expenses
    .filter((expense) => expense.type === "maintenance")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  const totalExpenses = totalParking + totalViolations + totalGasoline + totalMaintenance

  // Prepare monthly chart data
  const getMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    // Initialize monthly totals
    const monthlyTotals = months.map((month) => ({ name: month, amount: 0 }))

    // Sum expenses by month
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      // Only include expenses from current year
      if (expenseDate.getFullYear() === currentYear) {
        const monthIndex = expenseDate.getMonth()
        monthlyTotals[monthIndex].amount += Number(expense.amount)
      }
    })

    return monthlyTotals
  }

  const monthlyData = getMonthlyData()

  // Prepare filtered monthly data for each expense type
  const getParkingData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    // Initialize monthly totals
    const monthlyTotals = months.map((month) => ({ name: month, amount: 0 }))

    // Sum expenses by month
    expenses
      .filter((expense) => expense.type === "parking")
      .forEach((expense) => {
        const expenseDate = new Date(expense.date)
        // Only include expenses from current year
        if (expenseDate.getFullYear() === currentYear) {
          const monthIndex = expenseDate.getMonth()
          monthlyTotals[monthIndex].amount += Number(expense.amount)
        }
      })

    return monthlyTotals
  }

  const getViolationsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    // Initialize monthly totals
    const monthlyTotals = months.map((month) => ({ name: month, amount: 0 }))

    // Sum expenses by month
    expenses
      .filter((expense) => expense.type === "violation")
      .forEach((expense) => {
        const expenseDate = new Date(expense.date)
        // Only include expenses from current year
        if (expenseDate.getFullYear() === currentYear) {
          const monthIndex = expenseDate.getMonth()
          monthlyTotals[monthIndex].amount += Number(expense.amount)
        }
      })

    return monthlyTotals
  }

  const getGasolineData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    // Initialize monthly totals
    const monthlyTotals = months.map((month) => ({ name: month, amount: 0 }))

    // Sum expenses by month
    expenses
      .filter((expense) => expense.type === "gasoline")
      .forEach((expense) => {
        const expenseDate = new Date(expense.date)
        // Only include expenses from current year
        if (expenseDate.getFullYear() === currentYear) {
          const monthIndex = expenseDate.getMonth()
          monthlyTotals[monthIndex].amount += Number(expense.amount)
        }
      })

    return monthlyTotals
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time vehicle expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalParking.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses > 0 ? ((totalParking / totalExpenses) * 100).toFixed(1) : "0"}% of total expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traffic Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalViolations.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses > 0 ? ((totalViolations / totalExpenses) * 100).toFixed(1) : "0"}% of total expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasoline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGasoline.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses > 0 ? ((totalGasoline / totalExpenses) * 100).toFixed(1) : "0"}% of total expenses
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>View your vehicle expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Expenses</TabsTrigger>
              <TabsTrigger value="parking">Parking</TabsTrigger>
              <TabsTrigger value="violations">Violations</TabsTrigger>
              <TabsTrigger value="gasoline">Gasoline</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">Loading data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
            <TabsContent value="parking" className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">Loading data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getParkingData()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
            <TabsContent value="violations" className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">Loading data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getViolationsData()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
            <TabsContent value="gasoline" className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">Loading data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getGasolineData()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
