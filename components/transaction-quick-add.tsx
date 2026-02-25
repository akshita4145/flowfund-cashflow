"use client"

import { useState, useTransition } from "react"

import { useDemo } from "@/lib/demo-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TransactionQuickAdd() {
  const { mode, refreshSnapshot } = useDemo()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(null)
  const [form, setForm] = useState({
    description: "Demo transaction",
    category: "Software Licenses",
    amount: "250",
    type: "outflow" as "inflow" | "outflow",
    status: "completed" as "completed" | "pending" | "failed",
  })

  function submit() {
    setStatus(null)
    startTransition(async () => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          description: form.description,
          category: form.category,
          amount: Number(form.amount),
          type: form.type,
          status: form.status,
        }),
      })

      const json = (await res.json()) as { error?: string; transaction?: { id: string } }
      if (!res.ok) {
        setStatus(json.error ?? "Failed to create transaction")
        return
      }
      window.dispatchEvent(new Event("flowfund:transactions-updated"))
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("flowfund-demo-sync")
        channel.postMessage({ type: "transactions-updated", mode })
        channel.close()
      }
      refreshSnapshot()
      setStatus(`Created ${json.transaction?.id ?? "transaction"} in ${mode} mode`)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Add Transaction</CardTitle>
        <CardDescription>Writes to the backend demo store via `POST /api/transactions`.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Description"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="Category"
          />
          <Input
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="Amount"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            value={form.type}
            onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as "inflow" | "outflow" }))}
          >
            <SelectTrigger aria-label="Transaction type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inflow">Inflow</SelectItem>
              <SelectItem value="outflow">Outflow</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={form.status}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, status: value as "completed" | "pending" | "failed" }))
            }
          >
            <SelectTrigger aria-label="Transaction status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Toggle the sidebar demo mode to write into a different dataset.
          </p>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Saving..." : "Add"}
          </Button>
        </div>
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  )
}
