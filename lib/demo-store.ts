import { mkdirSync } from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { sql } from "@vercel/postgres"
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

function rowToTransaction(
  row: Pick<TxRow, "id" | "date" | "description" | "category" | "amount" | "type" | "status">
): Transaction {
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

function usingPostgres() {
  return Boolean(process.env.POSTGRES_URL)
}

let pgInitPromise: Promise<void> | null = null

async function initPostgres() {
  if (pgInitPromise) return pgInitPromise
  pgInitPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS flowfund_demo_transactions (
        created_seq BIGSERIAL PRIMARY KEY,
        mode TEXT NOT NULL,
        id TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('inflow', 'outflow')),
        status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
        UNIQUE(mode, id)
      )
    `
    await sql`
      CREATE INDEX IF NOT EXISTS flowfund_demo_transactions_mode_seq_idx
      ON flowfund_demo_transactions(mode, created_seq DESC)
    `
  })()
  return pgInitPromise
}

async function ensurePostgresSeeded(mode: DemoMode) {
  await initPostgres()
  const countRes = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM flowfund_demo_transactions
    WHERE mode = ${mode}
  `
  if (Number(countRes.rows[0]?.count ?? "0") > 0) return

  for (const tx of getTransactions(mode)) {
    await sql`
      INSERT INTO flowfund_demo_transactions (mode, id, date, description, category, amount, type, status)
      VALUES (${mode}, ${tx.id}, ${tx.date}, ${tx.description}, ${tx.category}, ${tx.amount}, ${tx.type}, ${tx.status})
      ON CONFLICT (mode, id) DO NOTHING
    `
  }
}

async function nextPostgresId(mode: DemoMode) {
  await ensurePostgresSeeded(mode)
  const res = await sql<{ id: string }>`
    SELECT id
    FROM flowfund_demo_transactions
    WHERE mode = ${mode}
  `
  const max = res.rows.reduce((acc, row) => {
    const match = row.id.match(/TXN-(\d+)/)
    return Math.max(acc, match ? Number(match[1]) : 0)
  }, 0)
  return `TXN-${String(max + 1).padStart(3, "0")}`
}

async function listTransactionsPostgres(mode: DemoMode) {
  await ensurePostgresSeeded(mode)
  const res = await sql<TxRow>`
    SELECT mode, id, date, description, category, amount, type, status, created_seq
    FROM flowfund_demo_transactions
    WHERE mode = ${mode}
    ORDER BY created_seq DESC
  `
  return res.rows.map(rowToTransaction)
}

async function createTransactionPostgres(input: CreateTransactionInput) {
  const signedAmount = input.type === "outflow" ? -Math.abs(input.amount) : Math.abs(input.amount)
  const created: Transaction = {
    id: await nextPostgresId(input.mode),
    date: input.date,
    description: input.description.trim(),
    category: input.category.trim(),
    amount: signedAmount,
    type: input.type,
    status: input.status ?? "completed",
  }

  await sql`
    INSERT INTO flowfund_demo_transactions (mode, id, date, description, category, amount, type, status)
    VALUES (${input.mode}, ${created.id}, ${created.date}, ${created.description}, ${created.category}, ${created.amount}, ${created.type}, ${created.status})
  `
  return { ...created }
}

async function updateTransactionPostgres(input: UpdateTransactionInput) {
  await ensurePostgresSeeded(input.mode)
  const existingRes = await sql<TxRow>`
    SELECT mode, id, date, description, category, amount, type, status, created_seq
    FROM flowfund_demo_transactions
    WHERE mode = ${input.mode} AND id = ${input.id}
    LIMIT 1
  `
  const existingRow = existingRes.rows[0]
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

  await sql`
    UPDATE flowfund_demo_transactions
    SET status = ${updated.status},
        description = ${updated.description},
        category = ${updated.category},
        amount = ${updated.amount},
        date = ${updated.date}
    WHERE mode = ${input.mode} AND id = ${input.id}
  `
  return { ...updated }
}

async function deleteTransactionPostgres(mode: DemoMode, id: string) {
  await ensurePostgresSeeded(mode)
  const res = await sql`
    DELETE FROM flowfund_demo_transactions
    WHERE mode = ${mode} AND id = ${id}
  `
  return (res.rowCount ?? 0) > 0
}

async function resetDemoStorePostgres(mode?: DemoMode) {
  await initPostgres()
  if (mode) {
    await sql`DELETE FROM flowfund_demo_transactions WHERE mode = ${mode}`
    return
  }
  await sql`DELETE FROM flowfund_demo_transactions`
}

// Local SQLite fallback (used when POSTGRES_URL is not configured)
let sqliteDb: DatabaseSync | null = null
let sqliteInitialized = false

function getSqliteDb() {
  if (sqliteDb) return sqliteDb
  const baseDir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data")
  mkdirSync(baseDir, { recursive: true })
  sqliteDb = new DatabaseSync(path.join(baseDir, "flowfund-demo.sqlite"))
  return sqliteDb
}

function initSqliteSchema() {
  if (sqliteInitialized) return
  const db = getSqliteDb()
  db.exec(`
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
  sqliteInitialized = true
}

function ensureSqliteSeeded(mode: DemoMode) {
  initSqliteSchema()
  const row = getSqliteDb()
    .prepare("SELECT COUNT(*) as count FROM transactions WHERE mode = ?")
    .get(mode) as { count: number } | undefined
  if ((row?.count ?? 0) > 0) return

  const insert = getSqliteDb().prepare(`
    INSERT INTO transactions (mode, id, date, description, category, amount, type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const tx of getTransactions(mode)) {
    insert.run(mode, tx.id, tx.date, tx.description, tx.category, tx.amount, tx.type, tx.status)
  }
}

function nextSqliteId(mode: DemoMode) {
  ensureSqliteSeeded(mode)
  const rows = getSqliteDb()
    .prepare("SELECT id FROM transactions WHERE mode = ?")
    .all(mode) as Array<{ id: string }>
  const max = rows.reduce((acc, row) => {
    const match = row.id.match(/TXN-(\d+)/)
    return Math.max(acc, match ? Number(match[1]) : 0)
  }, 0)
  return `TXN-${String(max + 1).padStart(3, "0")}`
}

function listTransactionsSqlite(mode: DemoMode) {
  ensureSqliteSeeded(mode)
  const rows = getSqliteDb()
    .prepare(`
      SELECT mode, id, date, description, category, amount, type, status, created_seq
      FROM transactions
      WHERE mode = ?
      ORDER BY created_seq DESC
    `)
    .all(mode) as TxRow[]
  return rows.map(rowToTransaction)
}

function createTransactionSqlite(input: CreateTransactionInput) {
  ensureSqliteSeeded(input.mode)
  const signedAmount = input.type === "outflow" ? -Math.abs(input.amount) : Math.abs(input.amount)
  const created: Transaction = {
    id: nextSqliteId(input.mode),
    date: input.date,
    description: input.description.trim(),
    category: input.category.trim(),
    amount: signedAmount,
    type: input.type,
    status: input.status ?? "completed",
  }
  getSqliteDb()
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

function updateTransactionSqlite(input: UpdateTransactionInput) {
  ensureSqliteSeeded(input.mode)
  const existingRow = getSqliteDb()
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

  getSqliteDb()
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

function deleteTransactionSqlite(mode: DemoMode, id: string) {
  ensureSqliteSeeded(mode)
  const result = getSqliteDb()
    .prepare("DELETE FROM transactions WHERE mode = ? AND id = ?")
    .run(mode, id) as { changes?: number }
  return (result.changes ?? 0) > 0
}

function resetDemoStoreSqlite(mode?: DemoMode) {
  initSqliteSchema()
  if (mode) {
    getSqliteDb().prepare("DELETE FROM transactions WHERE mode = ?").run(mode)
    return
  }
  getSqliteDb().exec("DELETE FROM transactions")
}

export async function listTransactions(mode: DemoMode) {
  return usingPostgres() ? listTransactionsPostgres(mode) : listTransactionsSqlite(mode)
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  return usingPostgres() ? createTransactionPostgres(input) : createTransactionSqlite(input)
}

export async function updateTransaction(input: UpdateTransactionInput): Promise<Transaction | null> {
  return usingPostgres() ? updateTransactionPostgres(input) : updateTransactionSqlite(input)
}

export async function deleteTransaction(mode: DemoMode, id: string): Promise<boolean> {
  return usingPostgres() ? deleteTransactionPostgres(mode, id) : deleteTransactionSqlite(mode, id)
}

export async function resetDemoStore(mode?: DemoMode): Promise<void> {
  return usingPostgres() ? resetDemoStorePostgres(mode) : resetDemoStoreSqlite(mode)
}
