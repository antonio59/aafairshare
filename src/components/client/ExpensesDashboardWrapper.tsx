'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the client component with no SSR
const ExpensesDashboard = dynamic(
  () => import('@/components/client/ExpensesDashboard').then(mod => mod.ExpensesDashboard),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);

export interface ExpensesDashboardWrapperProps {
  initialMonth?: string;
}

export function ExpensesDashboardWrapper({ initialMonth }: ExpensesDashboardWrapperProps) {
  return <ExpensesDashboard initialMonth={initialMonth} />;
}
