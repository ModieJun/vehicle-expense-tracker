import { ExpenseForm } from "@/components/expense-form"
import { ExpenseOverview } from "@/components/expense-overview"
import { ExpenseTable } from "@/components/expense-table"
import { ModeToggle } from "@/components/mode-toggle"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"
import { Toaster } from "@/components/ui/toaster"

export default async function Home() {

  try {
    await prisma.expense.count()

  } catch (error) {
    // If there's an error, redirect to the setup page
    console.log(error)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">Vehicle Expense Tracker</h1>
          <ModeToggle />
        </div>
      </header>
      <main className="container py-6">
      <SpeedInsights/>
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            <ExpenseForm />
          </div>
          <TabsContent value="overview" className="space-y-6">
            <ExpenseOverview/>
          </TabsContent>
          <TabsContent value="expenses" className="space-y-6">
            <ExpenseTable/>
          </TabsContent>
        </Tabs>
        <Toaster></Toaster>
      </main>
    </div>
  )
}
