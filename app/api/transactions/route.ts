import { NextResponse } from "next/server"

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  type CreateTransactionInput,
} from "@/lib/demo-store"
import type { DemoMode } from "@/lib/mock-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function parseMode(value: unknown): DemoMode | null {
  if (value === "healthy" || value === "at-risk") return value
  return null
}

export async function GET(request: Request) {
  const mode = parseMode(new URL(request.url).searchParams.get("mode")) ?? "healthy"
  return NextResponse.json(
    { mode, transactions: await listTransactions(mode) },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateTransactionInput>
  const mode = parseMode(body.mode)

  if (!mode) {
    return NextResponse.json({ error: "Invalid mode." }, { status: 400 })
  }
  if (!body.description?.trim() || !body.category?.trim()) {
    return NextResponse.json({ error: "Description and category are required." }, { status: 400 })
  }
  if (!body.date || Number.isNaN(new Date(body.date).getTime())) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 })
  }
  if (body.type !== "inflow" && body.type !== "outflow") {
    return NextResponse.json({ error: "Invalid transaction type." }, { status: 400 })
  }
  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 })
  }

  const created = await createTransaction({
    mode,
    date: body.date,
    description: body.description,
    category: body.category,
    amount: body.amount,
    type: body.type,
    status: body.status,
  })

  return NextResponse.json(
    { transaction: created },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  )
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const mode = parseMode(url.searchParams.get("mode"))
  const id = url.searchParams.get("id")?.trim()

  if (!mode) {
    return NextResponse.json({ error: "Invalid mode." }, { status: 400 })
  }
  if (!id) {
    return NextResponse.json({ error: "Transaction id is required." }, { status: 400 })
  }

  const deleted = await deleteTransaction(mode, id)
  if (!deleted) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 })
  }

  return NextResponse.json(
    { deleted: { id } },
    { headers: { "Cache-Control": "no-store" } }
  )
}
