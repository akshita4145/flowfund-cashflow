"use client"

import { useState, useMemo, useEffect } from "react"
import { useDemo } from "@/lib/demo-context"
import { getTransactions, type Transaction } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, Search, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterType = "all" | "inflow" | "outflow"
type FilterStatus = "all" | "completed" | "pending" | "failed"

function formatTransactionDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  // Keep old mock dates readable and show time for new ISO timestamps.
  if (value.includes("T")) {
    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TransactionsTable() {
  const { mode, refreshSnapshot } = useDemo()
  const [transactions, setTransactions] = useState<Transaction[]>(() => getTransactions(mode))
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<FilterType>("all")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/transactions?mode=${mode}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed")
        const data = (await res.json()) as { transactions?: Transaction[] }
        if (!cancelled && data.transactions) {
          setTransactions(data.transactions)
        }
      } catch {
        if (!cancelled) {
          setTransactions(getTransactions(mode))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    function onUpdated() {
      void load()
    }

    const channel =
      typeof window !== "undefined" && "BroadcastChannel" in window
        ? new BroadcastChannel("flowfund-demo-sync")
        : null

    function onChannelMessage() {
      void load()
    }

    void load()
    window.addEventListener("flowfund:transactions-updated", onUpdated)
    channel?.addEventListener("message", onChannelMessage)
    return () => {
      cancelled = true
      window.removeEventListener("flowfund:transactions-updated", onUpdated)
      channel?.removeEventListener("message", onChannelMessage)
      channel?.close()
    }
  }, [mode])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (
        search &&
        !t.description.toLowerCase().includes(search.toLowerCase()) &&
        !t.category.toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [transactions, typeFilter, statusFilter, search])

  async function removeTransaction(id: string) {
    if (deletingId || loading) return
    if (!window.confirm("Delete this transaction? This updates dashboards immediately.")) return

    setDeletingId(id)
    try {
      const res = await fetch(
        `/api/transactions?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      )
      if (!res.ok) return

      setTransactions((prev) => prev.filter((tx) => tx.id !== id))
      window.dispatchEvent(new Event("flowfund:transactions-updated"))
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("flowfund-demo-sync")
        channel.postMessage({ type: "transactions-updated", mode })
        channel.close()
      }
      refreshSnapshot()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Recent Transactions
            </CardTitle>
            <CardDescription>
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
              {loading ? " • refreshing..." : ""}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 pl-8 text-sm"
                aria-label="Search transactions"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as FilterType)}
            >
              <SelectTrigger className="h-8 w-28" size="sm" aria-label="Filter by type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="inflow">Inflows</SelectItem>
                <SelectItem value="outflow">Outflows</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as FilterStatus)}
            >
              <SelectTrigger className="h-8 w-32" size="sm" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((tx) => (
              <TableRow key={tx.id} className="group">
                <TableCell className="text-sm text-muted-foreground">
                  {formatTransactionDate(tx.date)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full",
                        tx.type === "inflow"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {tx.type === "inflow" ? (
                        <ArrowDownLeft className="size-3.5" />
                      ) : (
                        <ArrowUpRight className="size-3.5" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      {tx.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {tx.category}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right text-sm font-semibold tabular-nums",
                    tx.amount >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tx.status === "completed"
                        ? "secondary"
                        : tx.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                    className={cn(
                      "text-[11px] capitalize",
                      tx.status === "completed" &&
                        "bg-success/10 text-success border-0",
                      tx.status === "pending" &&
                        "border-warning/30 text-warning-foreground bg-warning/10"
                    )}
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void removeTransaction(tx.id)}
                    disabled={loading || deletingId === tx.id}
                    aria-label={`Delete transaction ${tx.id}`}
                  >
                    <Trash2 className="size-4" />
                    {deletingId === tx.id ? "Deleting..." : "Delete"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No transactions match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
