'use client';

import { useState, Suspense, lazy, useTransition } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { formatMonth } from '@/utils/formatters';
import type { Expense, ExpenseFilters } from '@/types/expenses';

// Error boundary component for React 19
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 rounded-md bg-destructive/10 text-destructive">
      <p>Error loading expenses: {error.message}</p>
      <Button 
        onClick={resetErrorBoundary}
        variant="outline"
        className="mt-2"
      >
        Retry
      </Button>
    </div>
  );
}

// Import smaller components using dynamic imports for better code splitting and React 19 hydration
const MonthSelector = lazy(() => 
  import('./expenses/MonthSelector').then(mod => ({ default: mod.MonthSelector }))
);
const ExpenseList = lazy(() => 
  import('./expenses/ExpenseList').then(mod => ({ default: mod.ExpenseList }))
);
const ExportButton = lazy(() => 
  import('./expenses/ExportButton').then(mod => ({ default: mod.ExportButton }))
);

// This is a fallback for any loading state
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
);

interface ExpensesDashboardProps {
  initialMonth?: string;
}

export function ExpensesDashboard({
  initialMonth = new Date().toISOString().slice(0, 7)
}: ExpensesDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [isPending, startTransition] = useTransition(); // React 19 concurrent mode transition
  const { toast } = useToast();
  
  const {
    expenses,
    isLoading,
    error,
    fetchExpenses,
    exportExpenses
  } = useExpenses();

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    // Use React 19 startTransition for smoother UI during expensive operations
    startTransition(() => {
      refreshExpenses(month);
    });
  };

  const refreshExpenses = async (month: string) => {
    const startDate = `${month}-01`;
    const date: Date = new Date(startDate);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    const endDate = date.toISOString().split('T')[0];
    
    const filters: ExpenseFilters = { startDate, endDate };
    await fetchExpenses(filters);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await exportExpenses(format);
      toast({
        title: 'Export Successful',
        description: `Expenses exported as ${format.toUpperCase()}`,
      });
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export expenses',
        variant: 'destructive',
      });
    }
  };

  // Error handling moved to ErrorFallback component
  if (error) {
    return (
      <ErrorFallback 
        error={new Error(error)} 
        resetErrorBoundary={() => handleMonthChange(selectedMonth)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Month display with loading indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {formatMonth(selectedMonth)}
          {isPending && <span className="ml-2 inline-block h-4 w-4 animate-pulse rounded-full bg-muted"></span>}
        </h2>
      </div>
      
      {/* Lazy-loaded month selector with Suspense boundary */}
      <Suspense fallback={<Skeleton className="h-12 w-full" />}>
        <div className="flex items-center justify-between flex-col md:flex-row gap-4">
          <Suspense fallback={<Skeleton className="h-10 w-48 rounded-md" />}>
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-10 w-40" />}>
            <ExportButton 
              onExport={handleExport} 
              disabled={isLoading || expenses.length === 0} 
            />
          </Suspense>
        </div>
      </Suspense>

      {isLoading ? (
        <LoadingSkeleton />
      ) : expenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No expenses found for {selectedMonth}</p>
        </div>
      ) : (
        <Suspense fallback={<LoadingSkeleton />}>
          <ExpenseList 
            expenses={expenses} 
            onUpdate={() => refreshExpenses(selectedMonth)} 
          />
        </Suspense>
      )}
    </div>
  );
}
