import { redirect } from "next/navigation"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseOverview } from "@/components/expense-overview"
import { ExpenseTable } from "@/components/expense-table"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  // Check if the database is set up
  try {
    await prisma.expense.count()
  } catch (error) {
    // If there's an error, redirect to the setup page
    redirect("/setup")
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
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>Enter the details of your vehicle expense below.</DialogDescription>
                </DialogHeader>
                <ExpenseForm />
              </DialogContent>
            </Dialog>
          </div>
          <TabsContent value="overview" className="space-y-6">
            <ExpenseOverview />
          </TabsContent>
          <TabsContent value="expenses" className="space-y-6">
            <ExpenseTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
