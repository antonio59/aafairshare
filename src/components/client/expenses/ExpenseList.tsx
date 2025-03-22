'use client';

import { Suspense } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Expense } from '@/types/expenses';
import { formatCurrency } from '@/utils/formatters';

export interface ExpenseListProps {
  expenses: Expense[];
  onUpdate?: () => Promise<void>;
  isLoading?: boolean;
}

// Smaller component for expense items
export interface ExpenseItemProps {
  expense: Expense;
}

function ExpenseItem({ expense }: ExpenseItemProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{expense.notes}</h3>
            <p className="text-sm text-muted-foreground">{expense.category_id}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(expense.amount)}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(expense.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpenseList({ expenses, isLoading, onUpdate: _onUpdate }: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] w-full" />
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <Card className="mb-3">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">No expenses found for this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {expenses.map((expense) => (
        <Suspense key={expense.id} fallback={<Skeleton className="h-[100px] w-full" />}>
          <ExpenseItem expense={expense} />
        </Suspense>
      ))}
    </div>
  );
}
