"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { DemoMode } from "@/lib/mock-data"

interface DemoContextValue {
  mode: DemoMode
  setMode: (mode: DemoMode) => void
  toggleMode: () => void
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DemoMode>("healthy")

  const toggleMode = () => {
    setMode((prev) => (prev === "healthy" ? "at-risk" : "healthy"))
  }

  return (
    <DemoContext.Provider value={{ mode, setMode, toggleMode }}>
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
