"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

type DemoSettings = {
  streamingInsights: boolean
  edgeReads: boolean
  safeNumbersOnly: boolean
  currency: string
}

const STORAGE_KEY = "flowfund-demo-settings"

export function SettingsPanel() {
  const [settings, setSettings] = useState<DemoSettings>({
    streamingInsights: true,
    edgeReads: true,
    safeNumbersOnly: true,
    currency: "USD",
  })

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Partial<DemoSettings>
      setSettings((prev) => ({ ...prev, ...parsed }))
    } catch {
      // Ignore malformed demo settings.
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Demo Settings</CardTitle>
        <CardDescription>Local settings to control demo behavior and presentation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="streaming-insights">Streaming insights</Label>
            <p className="text-xs text-muted-foreground">Use the SSE insights endpoint in forecast pages.</p>
          </div>
          <Switch
            id="streaming-insights"
            checked={settings.streamingInsights}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, streamingInsights: checked }))}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="edge-reads">Edge reads</Label>
            <p className="text-xs text-muted-foreground">Enable read-heavy API demos via edge runtime routes.</p>
          </div>
          <Switch
            id="edge-reads"
            checked={settings.edgeReads}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, edgeReads: checked }))}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="safe-numbers">Safe numbers only</Label>
            <p className="text-xs text-muted-foreground">Keep fictional values for public demos.</p>
          </div>
          <Switch
            id="safe-numbers"
            checked={settings.safeNumbersOnly}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, safeNumbersOnly: checked }))}
          />
        </div>
        <div className="rounded-lg border p-3">
          <Label htmlFor="currency" className="mb-2 block">
            Display currency
          </Label>
          <Input
            id="currency"
            value={settings.currency}
            onChange={(e) => setSettings((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
            className="max-w-32"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">LocalStorage persisted</Badge>
          <Badge variant="secondary">Demo-safe</Badge>
          <Badge variant="outline">No server writes</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

