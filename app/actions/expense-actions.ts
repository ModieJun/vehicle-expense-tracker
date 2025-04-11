"use server"

import { prisma } from "@/lib/prisma"
import { toClientExpenses } from "@/lib/prisma-fe-types"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema for expense validation
const expenseSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(["parking", "violation", "gasoline", "maintenance"]),
  date: z.coerce.date(),
  description: z.string().optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

// Create a new expense
export async function createExpense(data: ExpenseFormData) {
  try {
    const validatedData = expenseSchema.parse(data)

    const expense = await prisma.expense.create({
      data: {
        amount: validatedData.amount,
        type: validatedData.type,
        date: validatedData.date,
        description: validatedData.description || "",
      },
    })

    revalidatePath("/")
    return { success: true, data: expense }
  } catch (error) {
    console.error("Failed to create expense:", error)
    return { success: false, error: "Failed to create expense" }
  }
}

// Get all expenses
export async function getExpenses() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        date: "desc",
      },
    })
    const clientExpenses = toClientExpenses(expenses)
    return { success: true, data: clientExpenses }
  } catch (error) {
    console.error("Failed to fetch expenses:", error)
    return { success: false, error: "Failed to fetch expenses" }
  }
}

// Delete expenses by IDs
export async function deleteExpenses(ids: string[]) {
  try {
    await prisma.expense.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete expenses:", error)
    return { success: false, error: "Failed to delete expenses" }
  }
}

// Duplicate expenses by IDs
export async function duplicateExpenses(ids: string[]) {
  try {
    // Get the expenses to duplicate
    const expensesToDuplicate = await prisma.expense.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    // Create duplicates
    const duplicatePromises = expensesToDuplicate.map((expense) =>
      prisma.expense.create({
        data: {
          amount: expense.amount,
          type: expense.type,
          date: expense.date,
          description: expense.description ? `${expense.description} (Copy)` : "(Copy)",
        },
      }),
    )

    await Promise.all(duplicatePromises)

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to duplicate expenses:", error)
    return { success: false, error: "Failed to duplicate expenses" }
  }
}
