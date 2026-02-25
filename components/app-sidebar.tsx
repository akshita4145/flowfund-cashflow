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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Cash Flow", href: "/cash-flow", icon: Activity },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Forecast", href: "/forecast", icon: TrendingUp },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "relative flex items-center border-b border-sidebar-border py-5",
          collapsed ? "justify-center px-3" : "justify-between gap-2.5 px-6"
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex items-center justify-center rounded-lg bg-sidebar-primary p-1.5">
            <CircleDollarSign className="size-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed ? (
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              FlowFund
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "absolute top-4 right-2"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
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
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  className={cn(
                    "flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-150",
                    collapsed ? "justify-center px-2" : "gap-3 px-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="size-[18px] shrink-0" />
                  {!collapsed ? item.label : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
