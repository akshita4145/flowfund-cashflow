"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { PageHeader } from "@/components/page-header"
import { KPICards } from "@/components/kpi-cards"
import { InsightBanner } from "@/components/insight-banner"
import { CashRunwayCard } from "@/components/cash-runway-card"
import { TopDrivers } from "@/components/top-drivers"
import { ForecastSummaryPanel } from "@/components/dashboard-api-panels"

export default function CashFlowPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
        <PageHeader title="Cash Flow" description="Live cash health, burn rate, and obligations overview" />
        <section className="mb-6" aria-label="Cash flow insights">
          <InsightBanner />
        </section>
        <section className="mb-6" aria-label="Cash flow kpis">
          <KPICards />
        </section>
        <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ForecastSummaryPanel />
          </div>
          <CashRunwayCard />
        </section>
        <section aria-label="Top cash flow drivers">
          <TopDrivers />
        </section>
      </div>
    </DashboardShell>
  )
}

