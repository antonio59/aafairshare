'use client';

import React, { Suspense, lazy, useTransition } from 'react';
import { useQueryState } from 'nuqs';
import { useExpenses } from '@/hooks/useExpenses';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { formatMonth } from '@/utils/formatters';
import type { ExpenseFilters } from '@/types/expenses';

// Error boundary component for React 19 with improved error handling
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4 rounded-md bg-destructive/10 text-destructive">
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Something went wrong</h3>
        <p className="text-sm">Error loading expenses: {error.message}</p>
        <Button 
          onClick={resetErrorBoundary}
          variant="outline"
          size="sm"
          className="mt-2 w-fit"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}

// Import smaller components using dynamic imports with improved loading patterns for React 19
const MonthSelector = lazy(() => 
  import('./expenses/MonthSelector').then(mod => ({ default: mod.MonthSelector }))
);
const ExpenseList = lazy(() => 
  import('./expenses/ExpenseList').then(mod => ({ default: mod.ExpenseList }))
);
const ExportButton = lazy(() => 
  import('./expenses/ExportButton').then(mod => ({ default: mod.ExportButton }))
);

// Preload critical components for better user experience
// This is a React 19 optimization to start loading components before they're needed
// Immediately invoke to start loading on module initialization
(() => {
  import('./expenses/MonthSelector');
  import('./expenses/ExpenseList');
  import('./expenses/ExportButton');
})();

// This is a fallback for any loading state
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
);

export interface ExpensesDashboardProps {
  initialMonth?: string;
}

/**
 * Dashboard state interface for type safety
 */
export interface DashboardState {
  isExporting: boolean;
}

export function ExpensesDashboard({
  initialMonth = new Date().toISOString().slice(0, 7)
}: ExpensesDashboardProps) {
  // Use URL state management with nuqs for shareable URLs
  const [selectedMonth, setSelectedMonth] = useQueryState('month', {
    defaultValue: initialMonth,
    parse: (value: string) => {
      // Validate month format (YYYY-MM)
      return /^\d{4}-\d{2}$/.test(value) ? value : initialMonth;
    },
    serialize: (value: string) => value
  });
  
  // React 19 concurrent mode transition
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  // Consolidated component state
  const [dashboardState, setDashboardState] = React.useState<DashboardState>({
    isExporting: false
  });
  
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
      // Update state to show exporting status
      setDashboardState(prev => ({ ...prev, isExporting: true }));
      
      await exportExpenses(format);
      
      toast({
        title: 'Export Successful',
        description: `Expenses exported as ${format.toUpperCase()}`,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export expenses',
        variant: 'destructive',
      });
    } finally {
      // Reset exporting state
      setDashboardState(prev => ({ ...prev, isExporting: false }));
    }
  };

  // React 19 optimized error handling with proper error object construction
  if (error) {
    // Create a proper error object with additional context for better debugging
    const errorObj = new Error(error);
    errorObj.name = 'ExpensesFetchError';
    
    return (
      <ErrorFallback 
        error={errorObj} 
        resetErrorBoundary={() => {
          // Clear error state and retry with a fresh request
          handleMonthChange(selectedMonth);
        }} 
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
      
      {/* Optimized Suspense boundaries for React 19 */}
      {/* Using a single Suspense boundary for related UI elements */}
      <Suspense fallback={
        <div className="flex items-center justify-between flex-col md:flex-row gap-4">
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-10 w-40" />
        </div>
      }>
        <div className="flex items-center justify-between flex-col md:flex-row gap-4">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
          <ExportButton 
            onExport={handleExport} 
            disabled={isLoading || expenses.length === 0 || dashboardState.isExporting} 
            isLoading={dashboardState.isExporting}
          />
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
