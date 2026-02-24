"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { PageHeader } from "@/components/page-header"
import { GoalsPlanner } from "@/components/goals-planner"
import { ForecastSummaryPanel } from "@/components/dashboard-api-panels"

export default function GoalsPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
        <PageHeader title="Goals" description="Set a savings target and test runway impact with interactive planning" />
        <section className="mb-6" aria-label="Goals planner">
          <GoalsPlanner />
        </section>
        <section aria-label="Forecast baseline">
          <ForecastSummaryPanel />
        </section>
      </div>
    </DashboardShell>
  )
}

