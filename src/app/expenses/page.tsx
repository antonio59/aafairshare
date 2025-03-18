'use client';

import ExpensesDashboard from '@/components/ExpensesDashboard';

export default function ExpensesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      <ExpensesDashboard />
    </div>
  );
}