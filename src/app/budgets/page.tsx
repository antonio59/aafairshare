import { Suspense } from 'react';
import { BudgetData } from '@/components/server/BudgetData';
import { BudgetClient } from '@/components/BudgetClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = {
  title: 'Budgets | AAFairShare',
  description: 'Manage your budgets and track spending',
};

export default async function BudgetsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {/* Server Component */}
        <BudgetData />
        {/* Client Component */}
        <BudgetClient />
      </Suspense>
    </div>
  );
}
