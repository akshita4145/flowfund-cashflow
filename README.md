# FlowFund Cashflow

FlowFund is a cash flow forecasting and finance insights demo app.

It includes:

- transaction tracking (inflow / outflow / status)
- dashboard metrics (balance, burn, runway, net cash flow)
- forecast and category breakdowns
- rule-based finance insights
- an API surface that EdgeSight can connect to for a live demo

## What It Does

- stores demo transactions by mode (`healthy`, `at-risk`)
- computes a dashboard snapshot from transactions
- exposes snapshot and transactions via API routes
- supports quick-add transaction flows in the UI

## Key API Endpoints

### `GET /api/dashboard?mode=healthy`

Returns a computed dashboard snapshot:

- `metrics`
- `cashHealth`
- `forecast`
- `categoryBreakdown`
- `upcomingObligations`
- `insights`
- `transactions`

### `GET /api/transactions?mode=healthy`

Returns the current transactions list for the selected demo mode.

### `POST /api/transactions`

Creates a transaction in the selected demo mode.

Example body:

```json
{
  "mode": "healthy",
  "date": "Feb 25, 2026",
  "description": "Demo inflow",
  "category": "Revenue",
  "amount": 500,
  "type": "inflow",
  "status": "completed"
}
```

## Live Recalculation Behavior

The dashboard snapshot is recomputed from transactions so these values update after transaction writes:

- total balance (`completed` transactions only)
- monthly revenue / burn / net cash flow
- runway
- forecast
- category breakdown
- cash health score
- insights

Accounting semantics used in the demo:

- `completed`: affects current balance and realized cash flow metrics
- `pending`: does not affect current balance, but can affect obligations and insights
- `failed`: does not affect current balance

## EdgeSight Integration

EdgeSight can connect to FlowFund in `FlowFund Live` mode and fetch:

- `GET /api/transactions` for live metric adaptation
- `GET /api/dashboard` for finance insight text and snapshot metadata

If your FlowFund deployment is Vercel-protected, configure the bypass token in the **EdgeSight** project:

- `FLOWFUND_VERCEL_BYPASS_TOKEN`

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment (Vercel)

FlowFund can be deployed to Vercel and used as the backend for the EdgeSight live demo.

## Important Limitation (Current Demo Store)

FlowFund currently uses an **in-memory demo store** (`lib/demo-store.ts`).

This means on Vercel:

- transactions can reset to the seeded demo state
- data can differ across pages/requests
- behavior can appear inconsistent after cold starts or when requests hit different instances

This is expected for in-memory storage on serverless infrastructure.

### To make it reliable on Vercel

Replace the demo store with a persistent database-backed store (for example Vercel Postgres / Neon / Supabase).

## Project Structure

- `app/api/dashboard/route.ts` - computed dashboard snapshot API
- `app/api/transactions/route.ts` - transaction list/create API
- `lib/finance-engine.ts` - metric/forecast/insight computation
- `lib/demo-store.ts` - current in-memory transaction store
- `lib/demo-context.tsx` - client-side live snapshot loading/sync
- `components/*` - dashboard and transaction UI

## Notes

- This project is a demo and uses deterministic heuristics/rules for insights.
- For production use, add persistence, auth, and real bank/accounting integrations.
