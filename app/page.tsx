"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { KPICards } from "@/components/kpi-cards"
import { CashRunwayCard } from "@/components/cash-runway-card"
import { ForecastChart } from "@/components/forecast-chart"
import { TopDrivers } from "@/components/top-drivers"
import { TransactionsTable } from "@/components/transactions-table"
import { InsightBanner } from "@/components/insight-banner"
import { DemoProvider } from "@/lib/demo-context"
import { CalendarDays } from "lucide-react"

function DashboardContent() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                  Overview
                </h1>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  <span>{today}</span>
                </div>
              </div>
            </div>
          </header>

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
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <DemoProvider>
      <DashboardContent />
    </DemoProvider>
  )
}
