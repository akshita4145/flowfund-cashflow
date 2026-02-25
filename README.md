# FlowFund Cashflow

FlowFund is a cash flow forecasting and finance insights demo app.

It includes:

- transaction tracking (inflow / outflow / status)
- dashboard metrics (balance, burn, runway, net cash flow)
- forecast and category breakdowns
- rule-based finance insights
- an API surface that EdgeSight can connect to for a live demo

## What It Does

- stores demo transactions by mode (`healthy`, `at-risk`) in a local SQLite database
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

## Demo Store (Hybrid)

FlowFund uses a **hybrid demo store** in `lib/demo-store.ts`:

- **Vercel Postgres** when `POSTGRES_URL` is configured
- otherwise local SQLite
- local DB file path: `.data/flowfund-demo.sqlite` (created automatically on first request)
- seeded transactions are inserted once per mode (`healthy`, `at-risk`) if that mode has no rows yet
- transaction writes persist across local page reloads and requests

### Vercel caveat

If `POSTGRES_URL` is not configured, FlowFund falls back to local SQLite (`/tmp` on Vercel), which is not durable/shared on serverless infrastructure.

For reliable multi-instance deployments, use a managed persistent database (for example Vercel Postgres / Neon / Supabase).

### Vercel Postgres setup (recommended)

1. In the Vercel dashboard for `flowfund-cashflow`, add a **Postgres** storage integration.
2. Redeploy the project so `POSTGRES_URL` is available at build/runtime.
3. The app will automatically create the table and seed demo rows on first request.

## Project Structure

- `app/api/dashboard/route.ts` - computed dashboard snapshot API
- `app/api/transactions/route.ts` - transaction list/create API
- `lib/finance-engine.ts` - metric/forecast/insight computation
- `lib/demo-store.ts` - hybrid demo transaction store (Vercel Postgres or SQLite fallback)
- `lib/demo-context.tsx` - client-side live snapshot loading/sync
- `components/*` - dashboard and transaction UI

## Notes

- This project is a demo and uses deterministic heuristics/rules for insights.
- For production use, add a managed shared database, auth, and real bank/accounting integrations.
