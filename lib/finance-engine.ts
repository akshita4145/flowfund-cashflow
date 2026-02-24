import { getTransactions, type DemoMode, type ForecastPoint, type Transaction } from "@/lib/mock-data"

type InsightSeverity = "info" | "warning" | "critical"

export interface CashHealthScore {
  score: number
  grade: "A" | "B" | "C" | "D" | "F"
  summary: string
  drivers: Array<{ label: string; score: number; weight: number }>
}

export interface UpcomingObligation {
  id: string
  description: string
  category: string
  amount: number
  dueDate: string
  source: "pending" | "projected"
}

export interface CategoryBreakdownItem {
  category: string
  spend: number
  sharePct: number
  monthOverMonthPct: number
}

export interface FinancialInsight {
  id: string
  severity: InsightSeverity
  title: string
  message: string
  recommendation?: string
}

export interface ForecastSummary {
  nextMonthBalance: number
  endOfQuarterBalance: number
  worstCaseQuarterBalance: number
  points: ForecastPoint[]
}

export interface FinanceMetrics {
  currentBalance: number
  monthlyRevenue: number
  monthlyBurnRate: number
  monthlyNetCashFlow: number
  runwayMonths: number
  savingsTrajectory90d: number
  upcomingObligationsTotal: number
}

export interface DashboardSnapshot {
  mode: DemoMode
  generatedAt: string
  metrics: FinanceMetrics
  cashHealth: CashHealthScore
  forecast: ForecastSummary
  categoryBreakdown: CategoryBreakdownItem[]
  upcomingObligations: UpcomingObligation[]
  insights: FinancialInsight[]
  transactions: Transaction[]
}

const BASE_BALANCE_BY_MODE: Record<DemoMode, number> = {
  healthy: 284_520,
  "at-risk": 62_180,
}

const DAY_MS = 24 * 60 * 60 * 1000

function parseDate(input: string) {
  return new Date(input)
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function round(value: number) {
  return Math.round(value)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function gradeFromScore(score: number): CashHealthScore["grade"] {
  if (score >= 85) return "A"
  if (score >= 70) return "B"
  if (score >= 55) return "C"
  if (score >= 40) return "D"
  return "F"
}

function buildForecast(
  mode: DemoMode,
  currentBalance: number,
  monthlyNetCashFlow: number,
  volatilityFactor: number
): ForecastSummary {
  const now = new Date()
  const points: ForecastPoint[] = []
  const actualHistoryDays = 30
  const dailyTrend = monthlyNetCashFlow / 30
  const uncertaintyBase = Math.max(250, Math.abs(dailyTrend) * 4 + volatilityFactor * 0.05)
  const startingActual =
    currentBalance -
    dailyTrend * actualHistoryDays +
    (mode === "healthy" ? -2_000 : 6_000)

  for (let i = actualHistoryDays; i >= 1; i--) {
    const date = new Date(now.getTime() - i * DAY_MS)
    const value = startingActual + (actualHistoryDays - i) * dailyTrend
    points.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: round(value),
      forecast: null,
      lower: null,
      upper: null,
    })
  }

  const lastActual = points[points.length - 1]?.actual ?? currentBalance
  for (let i = 1; i <= 90; i++) {
    const date = new Date(now.getTime() + i * DAY_MS)
    const projected = lastActual + i * dailyTrend
    const uncertainty = uncertaintyBase + i * Math.max(40, uncertaintyBase * 0.08)
    points.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: null,
      forecast: round(projected),
      lower: round(projected - uncertainty),
      upper: round(projected + uncertainty),
    })
  }

  const nextMonthBalance = round(currentBalance + monthlyNetCashFlow)
  const endOfQuarterBalance = round(currentBalance + monthlyNetCashFlow * 3)
  const worstCaseQuarterBalance = round(
    currentBalance + (monthlyNetCashFlow - Math.abs(monthlyNetCashFlow) * 0.35 - volatilityFactor * 0.08) * 3
  )

  return {
    nextMonthBalance,
    endOfQuarterBalance,
    worstCaseQuarterBalance,
    points,
  }
}

function buildCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const byMonth = new Map<string, Map<string, number>>()
  const completedOutflows = transactions.filter(
    (tx) => tx.status === "completed" && tx.amount < 0
  )

  for (const tx of completedOutflows) {
    const date = parseDate(tx.date)
    const key = monthKey(date)
    const monthMap = byMonth.get(key) ?? new Map<string, number>()
    monthMap.set(tx.category, (monthMap.get(tx.category) ?? 0) + Math.abs(tx.amount))
    byMonth.set(key, monthMap)
  }

  const monthKeys = [...byMonth.keys()].sort()
  const current = byMonth.get(monthKeys[monthKeys.length - 1] ?? "") ?? new Map<string, number>()
  const previous = byMonth.get(monthKeys[monthKeys.length - 2] ?? "") ?? new Map<string, number>()
  const totalCurrent = [...current.values()].reduce((sum, amount) => sum + amount, 0)

  return [...current.entries()]
    .map(([category, spend]) => {
      const prev = previous.get(category) ?? 0
      const monthOverMonthPct = prev > 0 ? ((spend - prev) / prev) * 100 : spend > 0 ? 100 : 0
      return {
        category,
        spend: round(spend),
        sharePct: totalCurrent > 0 ? Number(((spend / totalCurrent) * 100).toFixed(1)) : 0,
        monthOverMonthPct: Number(monthOverMonthPct.toFixed(1)),
      }
    })
    .sort((a, b) => b.spend - a.spend)
}

function buildUpcomingObligations(transactions: Transaction[]): UpcomingObligation[] {
  const pending = transactions
    .filter((tx) => tx.status === "pending")
    .map((tx) => ({
      id: `pending-${tx.id}`,
      description: tx.description,
      category: tx.category,
      amount: Math.abs(tx.amount),
      dueDate: tx.date,
      source: "pending" as const,
    }))

  const outflowsByCategory = new Map<string, number[]>()
  for (const tx of transactions) {
    if (tx.status !== "completed" || tx.amount >= 0) continue
    const amounts = outflowsByCategory.get(tx.category) ?? []
    amounts.push(Math.abs(tx.amount))
    outflowsByCategory.set(tx.category, amounts)
  }

  const projected = [...outflowsByCategory.entries()]
    .map(([category, amounts], index) => {
      const avg = amounts.reduce((sum, value) => sum + value, 0) / amounts.length
      const due = new Date()
      due.setDate(due.getDate() + 7 + index * 6)
      return {
        id: `projected-${category.toLowerCase().replace(/\W+/g, "-")}`,
        description: `${category} (projected recurring)`,
        category,
        amount: round(avg),
        dueDate: due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        source: "projected" as const,
      }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)

  return [...pending, ...projected].slice(0, 6)
}

function buildInsights(input: {
  mode: DemoMode
  metrics: FinanceMetrics
  categoryBreakdown: CategoryBreakdownItem[]
  upcomingObligations: UpcomingObligation[]
  cashHealth: CashHealthScore
}): FinancialInsight[] {
  const { mode, metrics, categoryBreakdown, upcomingObligations, cashHealth } = input
  const insights: FinancialInsight[] = []
  const topCategory = categoryBreakdown[0]

  if (topCategory) {
    insights.push({
      id: "category-trend",
      severity: topCategory.monthOverMonthPct > 20 ? "warning" : "info",
      title: `${topCategory.category} is your top spend driver`,
      message:
        topCategory.monthOverMonthPct > 0
          ? `Spending in ${topCategory.category} is up ${topCategory.monthOverMonthPct}% month over month and represents ${topCategory.sharePct}% of current outflows.`
          : `${topCategory.category} represents ${topCategory.sharePct}% of current outflows and is trending down ${Math.abs(topCategory.monthOverMonthPct)}% month over month.`,
      recommendation:
        topCategory.monthOverMonthPct > 20
          ? `Set a category cap and review the largest ${topCategory.category.toLowerCase()} transactions this week.`
          : undefined,
    })
  }

  if (metrics.runwayMonths <= 3) {
    insights.push({
      id: "runway-critical",
      severity: "critical",
      title: "Runway is critically low",
      message: `At the current burn profile, cash runway is approximately ${metrics.runwayMonths.toFixed(1)} months.`,
      recommendation: "Reduce discretionary outflows or increase inflows to extend runway beyond 6 months.",
    })
  } else if (metrics.runwayMonths <= 6) {
    insights.push({
      id: "runway-warning",
      severity: "warning",
      title: "Runway needs attention",
      message: `Runway is ${metrics.runwayMonths.toFixed(1)} months. Upcoming obligations total $${metrics.upcomingObligationsTotal.toLocaleString()}.`,
      recommendation: "Prioritize expense controls and receivables collection this month.",
    })
  } else {
    insights.push({
      id: "runway-healthy",
      severity: "info",
      title: "Cash runway is in a healthy range",
      message: `Current runway is ${metrics.runwayMonths.toFixed(1)} months with net monthly cash flow of $${metrics.monthlyNetCashFlow.toLocaleString()}.`,
    })
  }

  const obligationsCoverage = metrics.currentBalance > 0
    ? (metrics.upcomingObligationsTotal / metrics.currentBalance) * 100
    : 100
  if (obligationsCoverage > 35) {
    insights.push({
      id: "obligation-coverage",
      severity: "warning",
      title: "Upcoming obligations are heavy relative to cash",
      message: `Scheduled and projected obligations are ${obligationsCoverage.toFixed(1)}% of current cash balance.`,
      recommendation: "Reschedule lower-priority payments or preserve liquidity buffers for the next two cycles.",
    })
  }

  insights.push({
    id: "cash-health-score",
    severity: cashHealth.score >= 70 ? "info" : cashHealth.score >= 45 ? "warning" : "critical",
    title: `Cash health score: ${cashHealth.score}/100 (${cashHealth.grade})`,
    message: cashHealth.summary,
  })

  if (mode === "healthy" && metrics.monthlyNetCashFlow > 0) {
    const improvement = round(metrics.monthlyNetCashFlow * 0.25)
    insights.push({
      id: "goal-acceleration",
      severity: "info",
      title: "Savings trajectory can improve with a small spend reduction",
      message: `Reducing discretionary spending by $${improvement.toLocaleString()}/month would materially improve your quarter-end cash position.`,
    })
  }

  return insights.slice(0, 5)
}

export function computeDashboardSnapshot(
  mode: DemoMode,
  transactions: Transaction[]
): DashboardSnapshot {
  const sorted = [...transactions].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
  )
  const latestDate = sorted.length ? parseDate(sorted[sorted.length - 1].date) : new Date()
  const currentMonth = monthKey(latestDate)

  let monthlyRevenue = 0
  let monthlyBurnRate = 0
  let monthlyNetCashFlow = 0
  let realizedNet = 0
  const monthlyAmounts: number[] = []

  for (const tx of sorted) {
    if (tx.status !== "completed") continue
    realizedNet += tx.amount
    const txMonth = monthKey(parseDate(tx.date))
    if (txMonth !== currentMonth) continue

    monthlyNetCashFlow += tx.amount
    monthlyAmounts.push(tx.amount)
    if (tx.amount >= 0) {
      monthlyRevenue += tx.amount
    } else {
      monthlyBurnRate += Math.abs(tx.amount)
    }
  }

  const seedRealizedNet = getTransactions(mode).reduce((sum, tx) => {
    if (tx.status !== "completed") return sum
    return sum + tx.amount
  }, 0)
  const balanceDeltaFromSeed = realizedNet - seedRealizedNet
  const currentBalance = Math.max(0, BASE_BALANCE_BY_MODE[mode] + balanceDeltaFromSeed)
  const netBurn = Math.max(0, monthlyBurnRate - monthlyRevenue)
  const runwayMonths = netBurn > 0 ? currentBalance / netBurn : 24
  const volatilityFactor =
    monthlyAmounts.length > 0
      ? Math.sqrt(
          monthlyAmounts.reduce((sum, value) => {
            const mean = monthlyNetCashFlow / monthlyAmounts.length
            return sum + (value - mean) ** 2
          }, 0) / monthlyAmounts.length
        )
      : 0

  const categoryBreakdown = buildCategoryBreakdown(sorted)
  const upcomingObligations = buildUpcomingObligations(sorted)
  const upcomingObligationsTotal = upcomingObligations.reduce((sum, item) => sum + item.amount, 0)
  const forecast = buildForecast(mode, currentBalance, monthlyNetCashFlow, volatilityFactor)
  const savingsTrajectory90d = forecast.endOfQuarterBalance - currentBalance

  const runwayScore = clamp((runwayMonths / 12) * 100, 0, 100)
  const flowScore = clamp(monthlyNetCashFlow >= 0 ? 70 + (monthlyNetCashFlow / 20000) * 30 : 70 - (Math.abs(monthlyNetCashFlow) / 20000) * 50, 0, 100)
  const obligationsScore = clamp(100 - (upcomingObligationsTotal / Math.max(currentBalance, 1)) * 120, 0, 100)
  const volatilityScore = clamp(100 - volatilityFactor / 250, 0, 100)
  const healthScoreValue = round(
    runwayScore * 0.35 + flowScore * 0.3 + obligationsScore * 0.2 + volatilityScore * 0.15
  )
  const cashHealth: CashHealthScore = {
    score: healthScoreValue,
    grade: gradeFromScore(healthScoreValue),
    summary:
      healthScoreValue >= 70
        ? "Healthy liquidity profile with manageable obligations and stable cash movements."
        : healthScoreValue >= 45
          ? "Mixed signal profile. Liquidity is acceptable, but burn and obligations need tighter control."
          : "High-risk cash profile driven by low runway, heavy obligations, or unstable cash movement.",
    drivers: [
      { label: "Runway", score: round(runwayScore), weight: 0.35 },
      { label: "Net Cash Flow", score: round(flowScore), weight: 0.3 },
      { label: "Obligation Coverage", score: round(obligationsScore), weight: 0.2 },
      { label: "Volatility", score: round(volatilityScore), weight: 0.15 },
    ],
  }

  const metrics: FinanceMetrics = {
    currentBalance: round(currentBalance),
    monthlyRevenue: round(monthlyRevenue),
    monthlyBurnRate: round(monthlyBurnRate),
    monthlyNetCashFlow: round(monthlyNetCashFlow),
    runwayMonths: Number(runwayMonths.toFixed(1)),
    savingsTrajectory90d: round(savingsTrajectory90d),
    upcomingObligationsTotal: round(upcomingObligationsTotal),
  }

  const insights = buildInsights({
    mode,
    metrics,
    categoryBreakdown,
    upcomingObligations,
    cashHealth,
  })

  return {
    mode,
    generatedAt: new Date().toISOString(),
    metrics,
    cashHealth,
    forecast,
    categoryBreakdown,
    upcomingObligations,
    insights,
    transactions: [...sorted].reverse(),
  }
}
