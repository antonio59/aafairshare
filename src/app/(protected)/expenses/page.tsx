import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ExpensesDashboardWrapper } from '@/components/client/ExpensesDashboardWrapper';
import { Skeleton } from '@/components/ui/skeleton';

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Expenses | AA Fair Share',
  description: 'View and manage your expenses',
};

export default async function ExpensesPage({ 
  searchParams = {} 
}: { 
  searchParams?: { [key: string]: string | string[] } 
}) {
  // Create Supabase client - cookie handling is managed by middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => null, // Let middleware handle cookie management
        set: () => {}, // No-op: cookie setting handled by middleware
        remove: () => {}, // No-op: cookie removal handled by middleware
      },
    }
  );

  // Verify auth session server-side
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return redirect('/signin');
  }

  // Extract month param, ensuring we get a string or undefined
  const month = typeof searchParams.month === 'string' ? searchParams.month : undefined;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <ExpensesDashboardWrapper initialMonth={month} />
      </Suspense>
    </div>
  );
}