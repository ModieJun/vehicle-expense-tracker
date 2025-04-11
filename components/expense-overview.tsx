"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Expense } from "@/lib/prisma-fe-types"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ExpenseOverviewProps {
  initialExpenses: Expense[]
}

export function ExpenseOverview({ initialExpenses }: ExpenseOverviewProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [isLoading, setIsLoading] = useState(false)
  const [showMonthly, setShowMonthly] = useState(false)
  const { toast } = useToast()

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate expenses by type
  const expensesByType = expenses.reduce((acc, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  // Prepare monthly chart data
  const getMonthlyData = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    if (showMonthly) {
      // Get daily data for current month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => ({
        name: String(i + 1),
        amount: 0,
      }))

      // Sum expenses by day for current month
      expenses.forEach((expense) => {
        const expenseDate = new Date(expense.date)
        if (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth) {
          const day = expenseDate.getDate() - 1
          dailyTotals[day].amount += Number(expense.amount)
        }
      })

      return dailyTotals
    } else {
      // Original yearly data by month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
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
  }

  const monthlyData = getMonthlyData()

  // Prepare filtered monthly data for each expense type
  const getParkingData = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    if (showMonthly) {
      // Get daily data for current month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => ({
        name: String(i + 1),
        amount: 0,
      }))

      // Sum expenses by day for current month
      expenses
        .filter((expense) => expense.type === "parking")
        .forEach((expense) => {
          const expenseDate = new Date(expense.date)
          if (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth) {
            const day = expenseDate.getDate() - 1
            dailyTotals[day].amount += Number(expense.amount)
          }
        })

      return dailyTotals
    } else {
      // Original yearly data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
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
  }

  const getViolationsData = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    if (showMonthly) {
      // Get daily data for current month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => ({
        name: String(i + 1),
        amount: 0,
      }))

      // Sum expenses by day for current month
      expenses
        .filter((expense) => expense.type === "violation")
        .forEach((expense) => {
          const expenseDate = new Date(expense.date)
          if (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth) {
            const day = expenseDate.getDate() - 1
            dailyTotals[day].amount += Number(expense.amount)
          }
        })

      return dailyTotals
    } else {
      // Original yearly data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
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
  }

  const getGasolineData = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    if (showMonthly) {
      // Get daily data for current month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => ({
        name: String(i + 1),
        amount: 0,
      }))

      // Sum expenses by day for current month
      expenses
        .filter((expense) => expense.type === "gasoline")
        .forEach((expense) => {
          const expenseDate = new Date(expense.date)
          if (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth) {
            const day = expenseDate.getDate() - 1
            dailyTotals[day].amount += Number(expense.amount)
          }
        })

      return dailyTotals
    } else {
      // Original yearly data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
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
  }

  // Get current month name for the title
  const getCurrentMonthName = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return months[new Date().getMonth()]
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {showMonthly ? `${getCurrentMonthName()} Expenses` : "Monthly Expenses"}
            </CardTitle>
            <CardDescription>
              {showMonthly 
                ? `Daily expenses for ${getCurrentMonthName()} ${new Date().getFullYear()}`
                : "View your vehicle expenses over time"}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-toggle" className="text-sm">
              {showMonthly ? "Daily View" : "Monthly View"}
            </Label>
            <Switch
              id="view-toggle"
              checked={showMonthly}
              onCheckedChange={setShowMonthly}
            />
          </div>
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
                    <Bar dataKey="amount" fill="#2E5374" radius={[4, 4, 0, 0]} />
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
                    <Bar dataKey="amount" fill="#1C4E80" radius={[4, 4, 0, 0]} />
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
                    <Bar dataKey="amount" fill="#9B2226" radius={[4, 4, 0, 0]} />
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
                    <Bar dataKey="amount" fill="#AE8F35" radius={[4, 4, 0, 0]} />
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
