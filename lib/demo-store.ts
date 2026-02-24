import { getTransactions, type DemoMode, type Transaction } from "@/lib/mock-data"

export interface CreateTransactionInput {
  mode: DemoMode
  date: string
  description: string
  category: string
  amount: number
  type: "inflow" | "outflow"
  status?: Transaction["status"]
}

export interface UpdateTransactionInput {
  mode: DemoMode
  id: string
  status?: Transaction["status"]
  description?: string
  category?: string
  amount?: number
  date?: string
}

const store = new Map<DemoMode, Transaction[]>()

function cloneTransaction(tx: Transaction): Transaction {
  return { ...tx }
}

function ensureMode(mode: DemoMode) {
  if (!store.has(mode)) {
    store.set(mode, getTransactions(mode).map(cloneTransaction))
  }
  return store.get(mode)!
}

function nextId(transactions: Transaction[]) {
  const max = transactions.reduce((acc, tx) => {
    const match = tx.id.match(/TXN-(\d+)/)
    return Math.max(acc, match ? Number(match[1]) : 0)
  }, 0)
  return `TXN-${String(max + 1).padStart(3, "0")}`
}

export function listTransactions(mode: DemoMode) {
  return [...ensureMode(mode)].map(cloneTransaction)
}

export function createTransaction(input: CreateTransactionInput): Transaction {
  const transactions = ensureMode(input.mode)
  const signedAmount =
    input.type === "outflow" ? -Math.abs(input.amount) : Math.abs(input.amount)

  const created: Transaction = {
    id: nextId(transactions),
    date: input.date,
    description: input.description.trim(),
    category: input.category.trim(),
    amount: signedAmount,
    type: input.type,
    status: input.status ?? "completed",
  }

  transactions.unshift(created)
  return cloneTransaction(created)
}

export function updateTransaction(input: UpdateTransactionInput): Transaction | null {
  const transactions = ensureMode(input.mode)
  const index = transactions.findIndex((tx) => tx.id === input.id)
  if (index < 0) return null

  const existing = transactions[index]
  const amount =
    input.amount == null
      ? existing.amount
      : existing.type === "outflow"
        ? -Math.abs(input.amount)
        : Math.abs(input.amount)

  const updated: Transaction = {
    ...existing,
    status: input.status ?? existing.status,
    description: input.description?.trim() || existing.description,
    category: input.category?.trim() || existing.category,
    amount,
    date: input.date ?? existing.date,
  }

  transactions[index] = updated
  return cloneTransaction(updated)
}

export function deleteTransaction(mode: DemoMode, id: string) {
  const transactions = ensureMode(mode)
  const index = transactions.findIndex((tx) => tx.id === id)
  if (index < 0) return false
  transactions.splice(index, 1)
  return true
}

export function resetDemoStore(mode?: DemoMode) {
  if (mode) {
    store.delete(mode)
    return
  }
  store.clear()
}

