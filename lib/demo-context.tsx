"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { DemoMode } from "@/lib/mock-data"
import type { DashboardSnapshot } from "@/lib/finance-engine"

interface DemoContextValue {
  mode: DemoMode
  setMode: (mode: DemoMode) => void
  toggleMode: () => void
  snapshot: DashboardSnapshot | null
  snapshotLoading: boolean
  refreshSnapshot: () => void
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DemoMode>("healthy")
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(true)
  const [refreshTick, setRefreshTick] = useState(0)

  const toggleMode = () => {
    setMode((prev) => (prev === "healthy" ? "at-risk" : "healthy"))
  }

  function refreshSnapshot() {
    setRefreshTick((n) => n + 1)
  }

  useEffect(() => {
    let cancelled = false

    async function loadSnapshot() {
      setSnapshotLoading(true)
      try {
        const res = await fetch(`/api/dashboard?mode=${mode}&_ts=${Date.now()}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Failed to load dashboard snapshot")
        const data = (await res.json()) as DashboardSnapshot
        if (!cancelled) setSnapshot(data)
      } catch {
        if (!cancelled) setSnapshot(null)
      } finally {
        if (!cancelled) setSnapshotLoading(false)
      }
    }

    function onTransactionsUpdated() {
      setRefreshTick((n) => n + 1)
    }

    void loadSnapshot()
    window.addEventListener("flowfund:transactions-updated", onTransactionsUpdated)
    return () => {
      cancelled = true
      window.removeEventListener("flowfund:transactions-updated", onTransactionsUpdated)
    }
  }, [mode, refreshTick])

  return (
    <DemoContext.Provider
      value={{ mode, setMode, toggleMode, snapshot, snapshotLoading, refreshSnapshot }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider")
  }
  return context
}
