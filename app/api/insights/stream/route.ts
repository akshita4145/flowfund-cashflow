import { computeDashboardSnapshot } from "@/lib/finance-engine"
import { listTransactions } from "@/lib/demo-store"
import type { DemoMode } from "@/lib/mock-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function parseMode(value: string | null): DemoMode {
  return value === "at-risk" ? "at-risk" : "healthy"
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = parseMode(url.searchParams.get("mode"))
  const snapshot = computeDashboardSnapshot(mode, listTransactions(mode))
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `event: meta\ndata: ${JSON.stringify({
            mode,
            generatedAt: snapshot.generatedAt,
            cashHealthScore: snapshot.cashHealth.score,
          })}\n\n`
        )
      )

      for (const insight of snapshot.insights) {
        controller.enqueue(
          encoder.encode(`event: insight\ndata: ${JSON.stringify(insight)}\n\n`)
        )
        await sleep(250)
      }

      controller.enqueue(encoder.encode(`event: done\ndata: {"ok":true}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  })
}
