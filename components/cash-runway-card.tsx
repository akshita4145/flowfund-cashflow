"use client"

import { useDemo } from "@/lib/demo-context"
import { getRunway } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { AlertTriangle, Shield, Clock } from "lucide-react"

export function CashRunwayCard() {
  const { mode } = useDemo()
  const runway = getRunway(mode)

  const maxMonths = 24
  const progressPercent = Math.min((runway.months / maxMonths) * 100, 100)

  return (
    <Card className="flex flex-col transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cash Runway
          </CardTitle>
          <div
            className={cn(
              "flex items-center justify-center rounded-lg p-2",
              runway.status === "safe"
                ? "bg-success/10 text-success"
                : runway.status === "warning"
                  ? "bg-warning/20 text-warning-foreground"
                  : "bg-destructive/10 text-destructive"
            )}
          >
            {runway.status === "safe" ? (
              <Shield className="size-4" />
            ) : runway.status === "warning" ? (
              <Clock className="size-4" />
            ) : (
              <AlertTriangle className="size-4" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-4xl font-bold tracking-tight",
              runway.status === "safe"
                ? "text-card-foreground"
                : runway.status === "warning"
                  ? "text-warning-foreground"
                  : "text-destructive"
            )}
          >
            {runway.months}
          </span>
          <span className="text-lg font-medium text-muted-foreground">months</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Runway progress</span>
            <span className="font-medium text-card-foreground">
              {runway.months}/{maxMonths} months
            </span>
          </div>
          <Progress
            value={progressPercent}
            className={cn(
              "h-2",
              runway.status === "critical" && "[&>[data-slot=progress-indicator]]:bg-destructive",
              runway.status === "warning" && "[&>[data-slot=progress-indicator]]:bg-warning"
            )}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Current Balance</span>
            <span className="font-semibold text-card-foreground">{runway.balance}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly Burn</span>
            <span className="font-semibold text-card-foreground">{runway.burnRate}</span>
          </div>
        </div>

        <p
          className={cn(
            "text-xs leading-relaxed",
            runway.status === "safe"
              ? "text-muted-foreground"
              : "font-medium text-destructive"
          )}
        >
          {runway.message}
        </p>
      </CardContent>
    </Card>
  )
}
