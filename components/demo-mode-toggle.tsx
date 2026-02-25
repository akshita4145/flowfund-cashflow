"use client"

import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useDemo } from "@/lib/demo-context"
import { cn } from "@/lib/utils"

export function DemoModeToggle() {
  const { mode, toggleMode } = useDemo()

  return (
    <div className="rounded-xl border border-border bg-card/80 px-3 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Demo Mode
          </div>
          <Badge
            variant="outline"
            className={cn(
              "mt-1 h-5 border-0 px-2 text-[10px] font-semibold",
              mode === "healthy"
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {mode === "healthy" ? "Healthy" : "At Risk"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium transition-colors",
              mode === "healthy" ? "text-foreground" : "text-muted-foreground"
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
              mode === "at-risk" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            At Risk
          </span>
        </div>
      </div>
    </div>
  )
}
