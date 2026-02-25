"use client"

import { useDemo } from "@/lib/demo-context"
import { getDrivers } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function TopDrivers() {
  const { mode, snapshot } = useDemo()
  const drivers = snapshot
    ? snapshot.categoryBreakdown.slice(0, 5).map((item) => ({
        category: item.category,
        amount: `$${item.spend.toLocaleString()}`,
        change: `${item.monthOverMonthPct >= 0 ? "+" : ""}${item.monthOverMonthPct}%`,
        changeType: item.monthOverMonthPct >= 0 ? ("increase" as const) : ("decrease" as const),
        percentage: item.monthOverMonthPct,
      }))
    : getDrivers(mode)

  return (
    <Card className="flex flex-col transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">
          Top Spend Drivers
        </CardTitle>
        <CardDescription>
          Categories with largest spend changes this month
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="flex flex-col gap-3" role="list">
          {drivers.map((driver, i) => (
            <li
              key={driver.category}
              className="group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-secondary/50"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
                {i + 1}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-card-foreground">
                  {driver.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {driver.amount}/mo
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold",
                    driver.changeType === "increase"
                      ? "text-destructive"
                      : "text-success"
                  )}
                >
                  {driver.changeType === "increase" ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {driver.change}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {driver.percentage > 0 ? "+" : ""}
                  {driver.percentage}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
