import { Suspense } from 'react'
import { ExpenseList } from '@/components/expenses/ExpenseList'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <ExpenseList />
      </Suspense>
    </main>
  )
}
