"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { PageHeader } from "@/components/page-header"
import { SettingsPanel } from "@/components/settings-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
        <PageHeader title="Settings" description="Demo controls, backend endpoints, and readiness toggles" />
        <section className="mb-6" aria-label="Demo settings">
          <SettingsPanel />
        </section>
        <section aria-label="Backend endpoint reference">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Backend Endpoints (Demo)</CardTitle>
              <CardDescription>These are now wired and ready to use in the UI and demos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md border p-2">
                <code>/api/dashboard?mode=healthy</code>
                <Badge variant="outline">Edge GET</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <code>/api/insights/stream?mode=at-risk</code>
                <Badge variant="outline">Edge SSE</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <code>/api/transactions</code>
                <Badge variant="secondary">GET / POST</Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  )
}

