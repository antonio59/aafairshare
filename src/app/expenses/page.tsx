import { Suspense } from 'react';
import { ExpensesData } from '@/components/server/expenses/ExpensesData';
import { ExpensesClient } from '@/components/ExpensesClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export { metadata } from './metadata';

interface PageProps {
  searchParams: {
    startDate?: string;
    endDate?: string;
    categories?: string;
    tags?: string;
    paidBy?: string;
    minAmount?: string;
    maxAmount?: string;
  };
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  // Parse search params
  const filters = {
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    categories: searchParams.categories?.split(','),
    tags: searchParams.tags?.split(','),
    paidBy: searchParams.paidBy?.split(','),
    minAmount: searchParams.minAmount ? parseFloat(searchParams.minAmount) : undefined,
    maxAmount: searchParams.maxAmount ? parseFloat(searchParams.maxAmount) : undefined,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {/* Server Component */}
        <ExpensesData filters={filters} />
        {/* Client Component */}
        <ExpensesClient />
      </Suspense>
    </div>
  );
}
