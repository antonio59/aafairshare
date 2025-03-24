import { Suspense } from 'react'

import { ExpensesDashboard } from '@/components/client/ExpensesDashboard'

export const dynamic = 'force-dynamic'

// Loading component for Suspense fallback
function ExpensesLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-md bg-gray-200 animate-pulse" />
      <div className="h-64 w-full rounded-md bg-gray-200 animate-pulse" />
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<ExpensesLoading />}>
      <ExpensesDashboard />
    </Suspense>
  )
}