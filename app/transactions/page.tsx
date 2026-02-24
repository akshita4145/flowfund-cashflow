"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { PageHeader } from "@/components/page-header"
import { TransactionQuickAdd } from "@/components/transaction-quick-add"
import { TransactionsTable } from "@/components/transactions-table"

export default function TransactionsPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
        <PageHeader title="Transactions" description="Search, filter, and write transactions into the demo backend store" />
        <section className="mb-6" aria-label="Quick add transaction">
          <TransactionQuickAdd />
        </section>
        <section aria-label="Transactions table">
          <TransactionsTable />
        </section>
      </div>
    </DashboardShell>
  )
}

