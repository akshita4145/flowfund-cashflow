import type { ReactNode } from "react"
import { CalendarDays } from "lucide-react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5" />
          <span>{description ?? today}</span>
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  )
}

