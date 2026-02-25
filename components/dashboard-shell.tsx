"use client"

import { useState, type ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"

export function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
