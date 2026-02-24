import { NextResponse } from "next/server"

import { computeDashboardSnapshot } from "@/lib/finance-engine"
import { listTransactions } from "@/lib/demo-store"
import type { DemoMode } from "@/lib/mock-data"

export const runtime = "edge"
export const dynamic = "force-dynamic"

function parseMode(value: string | null): DemoMode {
  return value === "at-risk" ? "at-risk" : "healthy"
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = parseMode(url.searchParams.get("mode"))
  const snapshot = computeDashboardSnapshot(mode, listTransactions(mode))

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  })
}

