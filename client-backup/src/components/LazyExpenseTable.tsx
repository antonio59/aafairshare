import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ExpenseWithDetails } from '@shared/schema';

// Lazy load the ExpenseTable component
const ExpenseTable = lazy(() => 
  import(/* webpackChunkName: "expense-table" */ './ExpenseTable').then(module => ({
    default: module.ExpenseTable
  }))
);

// Create skeleton loaders for the table
const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-muted/50 p-3">
        <div className="grid grid-cols-7 gap-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 border-t border-gray-200">
          <div className="grid grid-cols-7 gap-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Define props interface
interface LazyExpenseTableProps {
  expenses: ExpenseWithDetails[];
  onEdit: (expense: ExpenseWithDetails) => void;
  onDelete: (expense: ExpenseWithDetails) => void;
  isLoading: boolean;
  isMonthSettled?: boolean;
}

export function LazyExpenseTable(props: LazyExpenseTableProps) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ExpenseTable {...props} />
    </Suspense>
  );
}
