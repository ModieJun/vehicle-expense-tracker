/**
 * Client-side type definitions generated from Prisma schema
 */

export enum ExpenseType {
  PARKING = 'parking',
  VIOLATION = 'violation',
  GASOLINE = 'gasoline',
  MAINTENANCE = 'maintenance',
  TOLL   = 'toll'
}

export interface Expense {
  id: string;
  amount: number;
  type: ExpenseType;
  date: Date;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCreateInput {
  amount: number;
  type: ExpenseType;
  date: Date;
  description?: string | null;
}

export interface ExpenseUpdateInput {
  amount?: number;
  type?: ExpenseType;
  date?: Date;
  description?: string | null;
}

/**
 * Type for raw Prisma Expense with Decimal.js objects
 */
export type PrismaExpense = {
  id: string;
  amount: { toString: () => string };
  type: string;
  date: Date | string;
  description: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

/**
 * Converts a Prisma Expense to client-ready format
 * Handles conversion of Decimal.js to number and ensures dates are properly formatted
 */
export function toClientExpense(prismaExpense: PrismaExpense): Expense {
  return {
    id: prismaExpense.id,
    amount: parseFloat(prismaExpense.amount.toString()),
    type: prismaExpense.type as ExpenseType,
    date: prismaExpense.date instanceof Date ? prismaExpense.date : new Date(prismaExpense.date),
    description: prismaExpense.description,
    createdAt: prismaExpense.createdAt instanceof Date ? prismaExpense.createdAt : new Date(prismaExpense.createdAt),
    updatedAt: prismaExpense.updatedAt instanceof Date ? prismaExpense.updatedAt : new Date(prismaExpense.updatedAt),
  };
}

/**
 * Converts an array of Prisma Expenses to client-ready format
 */
export function toClientExpenses(prismaExpenses: PrismaExpense[]): Expense[] {
  return prismaExpenses.map(toClientExpense);
}
