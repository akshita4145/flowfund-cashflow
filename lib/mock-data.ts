export type DemoMode = "healthy" | "at-risk"

export interface KPIData {
  label: string
  value: string
  delta: string
  deltaType: "positive" | "negative" | "neutral"
  description: string
}

export interface RunwayData {
  months: number
  burnRate: string
  balance: string
  status: "safe" | "warning" | "critical"
  message: string
}

export interface ForecastPoint {
  date: string
  actual: number | null
  forecast: number | null
  lower: number | null
  upper: number | null
}

export interface Driver {
  category: string
  amount: string
  change: string
  changeType: "increase" | "decrease"
  percentage: number
}

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "inflow" | "outflow"
  status: "completed" | "pending" | "failed"
}

const healthyKPIs: KPIData[] = [
  {
    label: "Total Balance",
    value: "$284,520",
    delta: "+12.4%",
    deltaType: "positive",
    description: "vs. last month",
  },
  {
    label: "Monthly Revenue",
    value: "$48,250",
    delta: "+8.2%",
    deltaType: "positive",
    description: "vs. last month",
  },
  {
    label: "Monthly Burn",
    value: "$31,400",
    delta: "-3.1%",
    deltaType: "positive",
    description: "vs. last month",
  },
  {
    label: "Net Cash Flow",
    value: "+$16,850",
    delta: "+24.6%",
    deltaType: "positive",
    description: "vs. last month",
  },
]

const atRiskKPIs: KPIData[] = [
  {
    label: "Total Balance",
    value: "$62,180",
    delta: "-28.3%",
    deltaType: "negative",
    description: "vs. last month",
  },
  {
    label: "Monthly Revenue",
    value: "$22,400",
    delta: "-18.5%",
    deltaType: "negative",
    description: "vs. last month",
  },
  {
    label: "Monthly Burn",
    value: "$41,200",
    delta: "+15.7%",
    deltaType: "negative",
    description: "vs. last month",
  },
  {
    label: "Net Cash Flow",
    value: "-$18,800",
    delta: "-142%",
    deltaType: "negative",
    description: "vs. last month",
  },
]

const healthyRunway: RunwayData = {
  months: 18,
  burnRate: "$31,400/mo",
  balance: "$284,520",
  status: "safe",
  message: "Strong runway. You have 18+ months at current burn rate.",
}

const atRiskRunway: RunwayData = {
  months: 3,
  burnRate: "$41,200/mo",
  balance: "$62,180",
  status: "critical",
  message: "Critical: Only 3 months of runway left. Consider cutting spend.",
}

function generateForecastData(mode: DemoMode): ForecastPoint[] {
  const points: ForecastPoint[] = []
  const now = new Date()

  // Past 30 days (actuals)
  for (let i = 30; i >= 1; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const base = mode === "healthy" ? 260000 : 110000
    const trend = mode === "healthy" ? i * 800 * -1 + 30000 : i * -1600
    const noise = Math.random() * 8000 - 4000
    points.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: Math.round(base - trend + noise),
      forecast: null,
      lower: null,
      upper: null,
    })
  }

  // Next 90 days (forecast)
  const lastActual = points[points.length - 1].actual!
  for (let i = 1; i <= 90; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const trend = mode === "healthy" ? i * 560 : i * -620
    const uncertainty = i * 120
    const val = lastActual + trend
    points.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: null,
      forecast: Math.round(val),
      lower: Math.round(val - uncertainty),
      upper: Math.round(val + uncertainty),
    })
  }

  return points
}

const healthyDrivers: Driver[] = [
  { category: "Cloud Infrastructure", amount: "$8,420", change: "+$1,240", changeType: "increase", percentage: 17.3 },
  { category: "Payroll", amount: "$18,200", change: "+$2,100", changeType: "increase", percentage: 13.0 },
  { category: "Marketing & Ads", amount: "$4,800", change: "+$800", changeType: "increase", percentage: 20.0 },
  { category: "Software Licenses", amount: "$2,340", change: "+$340", changeType: "increase", percentage: 17.0 },
  { category: "Office & Supplies", amount: "$1,200", change: "-$150", changeType: "decrease", percentage: -11.1 },
]

const atRiskDrivers: Driver[] = [
  { category: "Payroll", amount: "$22,400", change: "+$5,600", changeType: "increase", percentage: 33.3 },
  { category: "Cloud Infrastructure", amount: "$12,800", change: "+$4,200", changeType: "increase", percentage: 48.8 },
  { category: "Marketing & Ads", amount: "$6,200", change: "+$3,100", changeType: "increase", percentage: 100.0 },
  { category: "Contractor Fees", amount: "$4,500", change: "+$2,800", changeType: "increase", percentage: 164.7 },
  { category: "Legal & Compliance", amount: "$3,200", change: "+$2,400", changeType: "increase", percentage: 300.0 },
]

const healthyTransactions: Transaction[] = [
  { id: "TXN-001", date: "Feb 24, 2026", description: "Stripe Revenue Deposit", category: "Revenue", amount: 12400, type: "inflow", status: "completed" },
  { id: "TXN-002", date: "Feb 23, 2026", description: "AWS Monthly Bill", category: "Cloud Infrastructure", amount: -2840, type: "outflow", status: "completed" },
  { id: "TXN-003", date: "Feb 22, 2026", description: "Client Invoice #1082", category: "Revenue", amount: 8500, type: "inflow", status: "pending" },
  { id: "TXN-004", date: "Feb 21, 2026", description: "Gusto Payroll", category: "Payroll", amount: -18200, type: "outflow", status: "completed" },
  { id: "TXN-005", date: "Feb 20, 2026", description: "Google Ads Campaign", category: "Marketing & Ads", amount: -1600, type: "outflow", status: "completed" },
  { id: "TXN-006", date: "Feb 19, 2026", description: "Consulting Revenue", category: "Revenue", amount: 5200, type: "inflow", status: "completed" },
  { id: "TXN-007", date: "Feb 18, 2026", description: "Notion Subscription", category: "Software Licenses", amount: -240, type: "outflow", status: "completed" },
  { id: "TXN-008", date: "Feb 17, 2026", description: "Client Retainer #AR-44", category: "Revenue", amount: 15000, type: "inflow", status: "completed" },
  { id: "TXN-009", date: "Feb 16, 2026", description: "WeWork Office Rent", category: "Office & Supplies", amount: -3200, type: "outflow", status: "completed" },
  { id: "TXN-010", date: "Feb 15, 2026", description: "Stripe Revenue Deposit", category: "Revenue", amount: 9800, type: "inflow", status: "completed" },
]

const atRiskTransactions: Transaction[] = [
  { id: "TXN-001", date: "Feb 24, 2026", description: "Stripe Revenue Deposit", category: "Revenue", amount: 4200, type: "inflow", status: "completed" },
  { id: "TXN-002", date: "Feb 23, 2026", description: "AWS Monthly Bill", category: "Cloud Infrastructure", amount: -6400, type: "outflow", status: "completed" },
  { id: "TXN-003", date: "Feb 22, 2026", description: "Client Invoice #1082", category: "Revenue", amount: 3800, type: "inflow", status: "pending" },
  { id: "TXN-004", date: "Feb 21, 2026", description: "Gusto Payroll", category: "Payroll", amount: -22400, type: "outflow", status: "completed" },
  { id: "TXN-005", date: "Feb 20, 2026", description: "Facebook Ads Burst", category: "Marketing & Ads", amount: -3100, type: "outflow", status: "completed" },
  { id: "TXN-006", date: "Feb 19, 2026", description: "Refund - Client #890", category: "Revenue", amount: -2400, type: "outflow", status: "failed" },
  { id: "TXN-007", date: "Feb 18, 2026", description: "Legal Retainer Fee", category: "Legal & Compliance", amount: -3200, type: "outflow", status: "completed" },
  { id: "TXN-008", date: "Feb 17, 2026", description: "Contractor Payment", category: "Contractor Fees", amount: -4500, type: "outflow", status: "pending" },
  { id: "TXN-009", date: "Feb 16, 2026", description: "WeWork Office Rent", category: "Office & Supplies", amount: -3200, type: "outflow", status: "completed" },
  { id: "TXN-010", date: "Feb 15, 2026", description: "Stripe Revenue Deposit", category: "Revenue", amount: 2100, type: "inflow", status: "completed" },
]

export function getKPIs(mode: DemoMode): KPIData[] {
  return mode === "healthy" ? healthyKPIs : atRiskKPIs
}

export function getRunway(mode: DemoMode): RunwayData {
  return mode === "healthy" ? healthyRunway : atRiskRunway
}

export function getForecast(mode: DemoMode): ForecastPoint[] {
  return generateForecastData(mode)
}

export function getDrivers(mode: DemoMode): Driver[] {
  return mode === "healthy" ? healthyDrivers : atRiskDrivers
}

export function getTransactions(mode: DemoMode): Transaction[] {
  return mode === "healthy" ? healthyTransactions : atRiskTransactions
}
