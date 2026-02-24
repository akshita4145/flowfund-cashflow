"use server"

import { revalidatePath } from "next/cache"

import { computeDashboardSnapshot } from "@/lib/finance-engine"
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/lib/demo-store"
import type { DemoMode } from "@/lib/mock-data"

interface ActionResult<T> {
  ok: boolean
  data?: T
  error?: string
}

function isDemoMode(value: string): value is DemoMode {
  return value === "healthy" || value === "at-risk"
}

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

function validateCreateInput(input: CreateTransactionInput): string | null {
  if (!isDemoMode(input.mode)) return "Invalid mode."
  if (!input.description.trim()) return "Description is required."
  if (!input.category.trim()) return "Category is required."
  if (!isValidDate(input.date)) return "Invalid date."
  if (!Number.isFinite(input.amount) || input.amount <= 0) return "Amount must be greater than 0."
  if (input.type !== "inflow" && input.type !== "outflow") return "Invalid transaction type."
  return null
}

export async function createTransactionAction(
  input: CreateTransactionInput
): Promise<ActionResult<ReturnType<typeof createTransaction>>> {
  const error = validateCreateInput(input)
  if (error) return { ok: false, error }

  const created = createTransaction(input)
  revalidatePath("/")
  return { ok: true, data: created }
}

export async function updateTransactionAction(
  input: UpdateTransactionInput
): Promise<ActionResult<NonNullable<ReturnType<typeof updateTransaction>>>> {
  if (!isDemoMode(input.mode)) return { ok: false, error: "Invalid mode." }
  if (!input.id.trim()) return { ok: false, error: "Transaction id is required." }
  if (input.amount != null && (!Number.isFinite(input.amount) || input.amount <= 0)) {
    return { ok: false, error: "Amount must be greater than 0." }
  }
  if (input.date && !isValidDate(input.date)) return { ok: false, error: "Invalid date." }

  const updated = updateTransaction(input)
  if (!updated) return { ok: false, error: "Transaction not found." }
  revalidatePath("/")
  return { ok: true, data: updated }
}

export async function deleteTransactionAction(
  mode: DemoMode,
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!isDemoMode(mode)) return { ok: false, error: "Invalid mode." }
  if (!id.trim()) return { ok: false, error: "Transaction id is required." }

  const deleted = deleteTransaction(mode, id)
  if (!deleted) return { ok: false, error: "Transaction not found." }
  revalidatePath("/")
  return { ok: true, data: { id } }
}

export async function getDashboardSnapshotAction(
  mode: DemoMode
): Promise<ActionResult<ReturnType<typeof computeDashboardSnapshot>>> {
  if (!isDemoMode(mode)) return { ok: false, error: "Invalid mode." }

  const transactions = listTransactions(mode)
  return { ok: true, data: computeDashboardSnapshot(mode, transactions) }
}

