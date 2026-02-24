import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

