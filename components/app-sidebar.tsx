"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Target,
  Settings,
  Activity,
  CircleDollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDemo } from "@/lib/demo-context"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Cash Flow", href: "/cash-flow", icon: Activity },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Forecast", href: "/forecast", icon: TrendingUp },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { mode, toggleMode } = useDemo()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center rounded-lg bg-sidebar-primary p-1.5">
          <CircleDollarSign className="size-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          FlowFund
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Main navigation">
        <ul className="flex flex-col gap-1" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="size-[18px] shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Demo Mode Toggle */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
              Demo Mode
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold border-0",
                mode === "healthy"
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {mode === "healthy" ? "Healthy" : "At Risk"}
            </Badge>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                mode === "healthy"
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/40"
              )}
            >
              Healthy
            </span>
            <Switch
              checked={mode === "at-risk"}
              onCheckedChange={toggleMode}
              aria-label="Toggle between healthy and at-risk demo data"
              className="data-[state=checked]:bg-destructive"
            />
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                mode === "at-risk"
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/40"
              )}
            >
              At Risk
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
