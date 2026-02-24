"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { PageHeader } from "@/components/page-header"
import { ForecastChart } from "@/components/forecast-chart"
import { ForecastSummaryPanel, StreamingInsightsPanel } from "@/components/dashboard-api-panels"

export default function ForecastPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
        <PageHeader title="Forecast" description="Projections, worst-case scenarios, and streaming insights" />
        <section className="mb-6" aria-label="Forecast chart">
          <ForecastChart />
        </section>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Backend forecast and insights">
          <ForecastSummaryPanel />
          <StreamingInsightsPanel />
        </section>
      </div>
    </DashboardShell>
  )
}

