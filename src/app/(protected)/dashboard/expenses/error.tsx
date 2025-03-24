'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function ExpensesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || 'Failed to load expenses.'}
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
} 