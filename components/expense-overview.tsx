"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import type { Expense } from "@/lib/prisma-fe-types"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getExpenses } from "@/app/actions/expense-actions"

export function ExpenseOverview() {
  const [mounted, setMounted] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showMonthly, setShowMonthly] = useState(false)

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

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate expenses by type
  const expensesByType = expenses.reduce(
    (acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Prepare monthly chart data with breakdown by expense type
  const getMonthlyBreakdownData = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    if (showMonthly) {
      // Get daily data for current month with breakdown
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => ({
        name: String(i + 1),
        parking: 0,
        violation: 0,
        gasoline: 0,
        maintenance: 0,
        toll: 0,
      }))

      // Sum expenses by day and type for current month
      expenses.forEach((expense) => {
        const expenseDate = new Date(expense.date)
        if (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth) {
          const day = expenseDate.getDate() - 1
          dailyTotals[day][expense.type] += Number(expense.amount)
        }
      })

      return dailyTotals
    } else {
      // Monthly data with breakdown by expense type
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthlyTotals = months.map((month) => ({
        name: month,
        parking: 0,
        violation: 0,
        gasoline: 0,
        maintenance: 0,
        toll: 0,
      }))

      // Sum expenses by month and type
      expenses.forEach((expense) => {
        const expenseDate = new Date(expense.date)
        // Only include expenses from current year
        if (expenseDate.getFullYear() === currentYear) {
          const monthIndex = expenseDate.getMonth()
          monthlyTotals[monthIndex][expense.type] += Number(expense.amount)
        }
      })

      return monthlyTotals
    }
  }

  const monthlyBreakdownData = getMonthlyBreakdownData()

  // Get current month name for the title
  const getCurrentMonthName = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[new Date().getMonth()]
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{showMonthly ? `Day ${label}` : label}</p>
          <p className="text-sm text-muted-foreground mb-2">Total: ${total.toFixed(2)}</p>
          {payload.map(
            (entry: any, index: number) =>
              entry.value > 0 && (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: ${entry.value.toFixed(2)}
                </p>
              ),
          )}
        </div>
      )
    }
    return null
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
        {Object.entries(expensesByType).map(([type, amount]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{type.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${amount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : "0"}% of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {showMonthly ? `${getCurrentMonthName()} Expense Breakdown` : "Monthly Expense Breakdown"}
            </CardTitle>
            <CardDescription>
              {showMonthly
                ? `Daily breakdown by expense type for ${getCurrentMonthName()} ${new Date().getFullYear()}`
                : "Monthly breakdown by expense type"}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-toggle" className="text-sm">
              {showMonthly ? "Daily View" : "Monthly View"}
            </Label>
            <Switch id="view-toggle" checked={showMonthly} onCheckedChange={setShowMonthly} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">Loading data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis
                    dataKey="name"
                    label={{ value: showMonthly ? "Day" : "Month", position: "insideBottom", offset: -10 }}
                  />
                  <YAxis label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="parking" stackId="a" fill="#1C4E80" name="Parking" />
                  <Bar dataKey="violation" stackId="a" fill="#9B2226" name="Violation" />
                  <Bar dataKey="gasoline" stackId="a" fill="#AE8F35" name="Gasoline" />
                  <Bar dataKey="maintenance" stackId="a" fill="#2E5374" name="Maintenance" />
                  <Bar dataKey="toll" stackId="a" fill="#171299" name="Toll" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
