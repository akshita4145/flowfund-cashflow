"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { KPICards } from "@/components/kpi-cards"
import { CashRunwayCard } from "@/components/cash-runway-card"
import { ForecastChart } from "@/components/forecast-chart"
import { TopDrivers } from "@/components/top-drivers"
import { TransactionsTable } from "@/components/transactions-table"
import { InsightBanner } from "@/components/insight-banner"
import { PageHeader } from "@/components/page-header"

function DashboardContent() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
          <PageHeader title="Overview" />

          {/* Insight Banner */}
          <section className="mb-6" aria-label="Financial insights">
            <InsightBanner />
          </section>

          {/* KPI Cards */}
          <section className="mb-6" aria-label="Key performance indicators">
            <KPICards />
          </section>

          {/* Chart + Sidebar cards */}
          <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3" aria-label="Forecast and analysis">
            <div className="xl:col-span-2">
              <ForecastChart />
            </div>
            <div className="flex flex-col gap-4">
              <CashRunwayCard />
            </div>
          </section>

          {/* Top Drivers */}
          <section className="mb-6" aria-label="Top spending drivers">
            <TopDrivers />
          </section>

          {/* Transactions */}
          <section aria-label="Recent transactions">
            <TransactionsTable />
          </section>
      </div>
    </DashboardShell>
  )
}

export default function Page() {
  return <DashboardContent />
}
