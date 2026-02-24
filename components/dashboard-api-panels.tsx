"use client"

import { useEffect, useMemo, useState } from "react"

import { useDemo } from "@/lib/demo-context"
import type { DashboardSnapshot } from "@/lib/finance-engine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`
}

export function ForecastSummaryPanel() {
  const { mode } = useDemo()
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/dashboard?mode=${mode}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return (await res.json()) as DashboardSnapshot
      })
      .then((data) => {
        if (!cancelled) setSnapshot(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load snapshot")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [mode])

  const cards = useMemo(() => {
    if (!snapshot) return []
    return [
      {
        label: "Next Month Balance",
        value: formatMoney(snapshot.forecast.nextMonthBalance),
        tone: "default",
      },
      {
        label: "End of Quarter",
        value: formatMoney(snapshot.forecast.endOfQuarterBalance),
        tone: "default",
      },
      {
        label: "Worst Case (EOQ)",
        value: formatMoney(snapshot.forecast.worstCaseQuarterBalance),
        tone: snapshot.forecast.worstCaseQuarterBalance < 0 ? "destructive" : "outline",
      },
      {
        label: "Cash Health Score",
        value: `${snapshot.cashHealth.score}/100 (${snapshot.cashHealth.grade})`,
        tone: snapshot.cashHealth.score >= 70 ? "secondary" : snapshot.cashHealth.score >= 45 ? "outline" : "destructive",
      },
    ] as const
  }, [snapshot])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Backend Forecast Snapshot</CardTitle>
        <CardDescription>Computed by `/api/dashboard` using the server finance engine.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading forecast snapshot...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && snapshot && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {cards.map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="text-lg font-semibold text-card-foreground">{item.value}</div>
                  <Badge variant={item.tone as "default" | "secondary" | "outline" | "destructive"}>
                    live
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type StreamEvent = {
  type: "meta" | "insight" | "done"
  payload: Record<string, unknown>
}

export function StreamingInsightsPanel() {
  const { mode } = useDemo()
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [status, setStatus] = useState<"idle" | "connecting" | "streaming" | "done" | "error">("idle")

  useEffect(() => {
    const es = new EventSource(`/api/insights/stream?mode=${mode}`)
    setEvents([])
    setStatus("connecting")

    es.addEventListener("open", () => setStatus("streaming"))
    es.addEventListener("meta", (evt) => {
      setEvents((prev) => [...prev, { type: "meta", payload: JSON.parse((evt as MessageEvent).data) }])
    })
    es.addEventListener("insight", (evt) => {
      setEvents((prev) => [...prev, { type: "insight", payload: JSON.parse((evt as MessageEvent).data) }])
    })
    es.addEventListener("done", (evt) => {
      setEvents((prev) => [...prev, { type: "done", payload: JSON.parse((evt as MessageEvent).data) }])
      setStatus("done")
      es.close()
    })
    es.onerror = () => {
      setStatus("error")
      es.close()
    }

    return () => es.close()
  }, [mode])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Streaming Insights</CardTitle>
        <CardDescription>SSE feed from `/api/insights/stream` (Edge runtime).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={status === "error" ? "destructive" : "outline"}>{status}</Badge>
          <span className="text-muted-foreground">{events.length} events</span>
        </div>
        <div className="max-h-72 space-y-2 overflow-auto rounded-lg border p-3">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Waiting for stream events...</p>
          ) : (
            events.map((event, index) => (
              <div key={`${event.type}-${index}`} className="rounded-md bg-secondary/40 p-2">
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {event.type}
                </div>
                <pre className="whitespace-pre-wrap break-words text-xs text-card-foreground">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

