"use client"

import { useMemo, useState } from "react"

import { useDemo } from "@/lib/demo-context"
import { getRunway } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"

export function GoalsPlanner() {
  const { mode } = useDemo()
  const runway = getRunway(mode)
  const [goalAmount, setGoalAmount] = useState(10000)
  const [monthlyReduction, setMonthlyReduction] = useState(300)

  const calc = useMemo(() => {
    const currentBalance = Number(runway.balance.replace(/[$,]/g, ""))
    const currentBurn = Number(runway.burnRate.replace(/[$,]/g, "").replace("/mo", ""))
    const effectiveSavings = Math.max(100, monthlyReduction)
    const monthsToGoal = Math.max(1, Math.ceil(goalAmount / effectiveSavings))
    const extendedRunway = currentBurn > 0 ? currentBalance / Math.max(1, currentBurn - monthlyReduction) : runway.months
    const progressPct = Math.min((monthlyReduction / 2000) * 100, 100)
    return { monthsToGoal, extendedRunway, progressPct }
  }, [goalAmount, monthlyReduction, runway.balance, runway.burnRate, runway.months])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Savings Goal Planner</CardTitle>
        <CardDescription>Interactive goal planning for demo conversations and user scenarios.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Target emergency buffer</span>
            <span className="font-semibold">${goalAmount.toLocaleString()}</span>
          </div>
          <Slider value={[goalAmount]} min={2000} max={50000} step={500} onValueChange={(v) => setGoalAmount(v[0] ?? 10000)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Monthly discretionary reduction</span>
            <span className="font-semibold">${monthlyReduction.toLocaleString()}/mo</span>
          </div>
          <Slider
            value={[monthlyReduction]}
            min={0}
            max={2000}
            step={50}
            onValueChange={(v) => setMonthlyReduction(v[0] ?? 300)}
          />
          <Progress value={calc.progressPct} className="h-2" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Estimated time to goal</div>
            <div className="mt-1 text-xl font-semibold">{calc.monthsToGoal} months</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Projected runway with cuts</div>
            <div className="mt-1 text-xl font-semibold">{calc.extendedRunway.toFixed(1)} months</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Mode: <span className="font-medium">{mode}</span>. This planner uses demo assumptions and should be replaced by
          backend snapshot data for production users.
        </p>
      </CardContent>
    </Card>
  )
}

