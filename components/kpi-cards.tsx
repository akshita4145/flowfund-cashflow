"use client"

import { useDemo } from "@/lib/demo-context"
import { getKPIs } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  BarChart3,
  Flame,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap = [DollarSign, BarChart3, Flame, Zap]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function KPICards() {
  const { mode, snapshot } = useDemo()
  const kpis = snapshot
    ? [
        {
          label: "Total Balance",
          value: formatCurrency(snapshot.metrics.currentBalance),
          delta: "Live",
          deltaType: "neutral" as const,
          description: "updates from transactions",
        },
        {
          label: "Monthly Revenue",
          value: formatCurrency(snapshot.metrics.monthlyRevenue),
          delta: "Live",
          deltaType: "neutral" as const,
          description: "completed inflows this month",
        },
        {
          label: "Monthly Burn",
          value: formatCurrency(snapshot.metrics.monthlyBurnRate),
          delta: "Live",
          deltaType: "neutral" as const,
          description: "completed outflows this month",
        },
        {
          label: "Net Cash Flow",
          value: `${snapshot.metrics.monthlyNetCashFlow >= 0 ? "+" : "-"}${formatCurrency(
            Math.abs(snapshot.metrics.monthlyNetCashFlow)
          )}`,
          delta: "Live",
          deltaType:
            snapshot.metrics.monthlyNetCashFlow > 0
              ? ("positive" as const)
              : snapshot.metrics.monthlyNetCashFlow < 0
                ? ("negative" as const)
                : ("neutral" as const),
          description: "monthly completed net",
        },
      ]
    : getKPIs(mode)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, i) => {
        const Icon = iconMap[i]
        return (
          <Card
            key={kpi.label}
            className="group relative overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </span>
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg p-2 transition-colors",
                    kpi.deltaType === "positive"
                      ? "bg-success/10 text-success"
                      : kpi.deltaType === "negative"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold tracking-tight text-card-foreground">
                  {kpi.value}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
                    kpi.deltaType === "positive"
                      ? "bg-success/10 text-success"
                      : kpi.deltaType === "negative"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {kpi.deltaType === "positive" ? (
                    <TrendingUp className="size-3" />
                  ) : kpi.deltaType === "negative" ? (
                    <TrendingDown className="size-3" />
                  ) : (
                    <Minus className="size-3" />
                  )}
                  {kpi.delta}
                </span>
                <span className="text-xs text-muted-foreground">
                  {kpi.description}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
