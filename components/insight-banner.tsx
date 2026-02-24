"use client"

import { useDemo } from "@/lib/demo-context"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, X } from "lucide-react"
import { useState } from "react"

export function InsightBanner() {
  const { mode } = useDemo()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const isHealthy = mode === "healthy"

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 rounded-xl border p-4 transition-all duration-300",
        isHealthy
          ? "border-success/20 bg-success/5"
          : "border-destructive/20 bg-destructive/5"
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isHealthy ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}
      >
        {isHealthy ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <AlertTriangle className="size-4" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p
          className={cn(
            "text-sm font-semibold",
            isHealthy ? "text-success" : "text-destructive"
          )}
        >
          {isHealthy
            ? "Finances on Track"
            : "Immediate Attention Required"}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isHealthy
            ? "Your cash position is strong with 18+ months of runway. Revenue is growing steadily and burn rate is under control."
            : "Cash runway is critically low at 3 months. Burn rate has increased 15.7% while revenue dropped 18.5%. Review spend immediately."}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="mt-0.5 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-card-foreground transition-colors"
        aria-label="Dismiss insight"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
