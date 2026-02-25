import { mkdirSync } from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"

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

type TxRow = {
  mode: DemoMode
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: Transaction["type"]
  status: Transaction["status"]
  created_seq: number
}

let db: DatabaseSync | null = null
let initialized = false

function getDb() {
  if (db) return db

  const dataDir = path.join(process.cwd(), ".data")
  mkdirSync(dataDir, { recursive: true })
  const dbPath = path.join(dataDir, "flowfund-demo.sqlite")
  db = new DatabaseSync(dbPath)
  return db
}

function initSchema() {
  if (initialized) return
  const database = getDb()
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transactions (
      mode TEXT NOT NULL,
      id TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('inflow', 'outflow')),
      status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
      created_seq INTEGER PRIMARY KEY AUTOINCREMENT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_mode_id ON transactions(mode, id);
    CREATE INDEX IF NOT EXISTS idx_transactions_mode_seq ON transactions(mode, created_seq DESC);
  `)
  initialized = true
}

function rowToTransaction(row: Omit<TxRow, "mode" | "created_seq">): Transaction {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    category: row.category,
    amount: Number(row.amount),
    type: row.type,
    status: row.status,
  }
}

function ensureSeeded(mode: DemoMode) {
  initSchema()
  const database = getDb()
  const countRow = database
    .prepare("SELECT COUNT(*) as count FROM transactions WHERE mode = ?")
    .get(mode) as { count: number } | undefined

  if ((countRow?.count ?? 0) > 0) return

  const insert = database.prepare(`
    INSERT INTO transactions (mode, id, date, description, category, amount, type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const tx of getTransactions(mode)) {
    insert.run(
      mode,
      tx.id,
      tx.date,
      tx.description,
      tx.category,
      tx.amount,
      tx.type,
      tx.status
    )
  }
}

function nextId(mode: DemoMode) {
  ensureSeeded(mode)
  const database = getDb()
  const row = database
    .prepare("SELECT id FROM transactions WHERE mode = ?")
    .all(mode) as Array<{ id: string }>
  const max = row.reduce((acc, tx) => {
    const match = tx.id.match(/TXN-(\d+)/)
    return Math.max(acc, match ? Number(match[1]) : 0)
  }, 0)
  return `TXN-${String(max + 1).padStart(3, "0")}`
}

export function listTransactions(mode: DemoMode) {
  ensureSeeded(mode)
  const rows = getDb()
    .prepare(`
      SELECT mode, id, date, description, category, amount, type, status, created_seq
      FROM transactions
      WHERE mode = ?
      ORDER BY created_seq DESC
    `)
    .all(mode) as TxRow[]

  return rows.map((row) => rowToTransaction(row))
}

export function createTransaction(input: CreateTransactionInput): Transaction {
  ensureSeeded(input.mode)
  const signedAmount =
    input.type === "outflow" ? -Math.abs(input.amount) : Math.abs(input.amount)

  const created: Transaction = {
    id: nextId(input.mode),
    date: input.date,
    description: input.description.trim(),
    category: input.category.trim(),
    amount: signedAmount,
    type: input.type,
    status: input.status ?? "completed",
  }

  getDb()
    .prepare(`
      INSERT INTO transactions (mode, id, date, description, category, amount, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      input.mode,
      created.id,
      created.date,
      created.description,
      created.category,
      created.amount,
      created.type,
      created.status
    )

  return { ...created }
}

export function updateTransaction(input: UpdateTransactionInput): Transaction | null {
  ensureSeeded(input.mode)
  const existingRow = getDb()
    .prepare(`
      SELECT mode, id, date, description, category, amount, type, status, created_seq
      FROM transactions
      WHERE mode = ? AND id = ?
      LIMIT 1
    `)
    .get(input.mode, input.id) as TxRow | undefined
  if (!existingRow) return null

  const existing = rowToTransaction(existingRow)
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

  getDb()
    .prepare(`
      UPDATE transactions
      SET status = ?, description = ?, category = ?, amount = ?, date = ?
      WHERE mode = ? AND id = ?
    `)
    .run(
      updated.status,
      updated.description,
      updated.category,
      updated.amount,
      updated.date,
      input.mode,
      input.id
    )

  return { ...updated }
}

export function deleteTransaction(mode: DemoMode, id: string) {
  ensureSeeded(mode)
  const result = getDb()
    .prepare("DELETE FROM transactions WHERE mode = ? AND id = ?")
    .run(mode, id) as { changes?: number }
  return (result.changes ?? 0) > 0
}

export function resetDemoStore(mode?: DemoMode) {
  initSchema()
  if (mode) {
    getDb().prepare("DELETE FROM transactions WHERE mode = ?").run(mode)
    return
  }
  getDb().exec("DELETE FROM transactions")
}
