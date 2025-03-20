import { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the client component with no SSR
const ExpensesDashboard = dynamic(
  () => import('@/components/client/ExpensesDashboard').then(mod => mod.ExpensesDashboard),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);

interface PageProps {
  searchParams: { month?: string };
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  // Create Supabase client - cookie handling is managed by middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Let middleware handle cookie management
          return null;
        },
        set(name: string, value: string) {
          // No-op: cookie setting handled by middleware
        },
        remove(name: string) {
          // No-op: cookie removal handled by middleware
        },
      },
    }
  );

  // Verify auth session server-side
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return redirect('/signin');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <ExpensesDashboard initialMonth={searchParams.month} />
      </Suspense>
    </div>
  );
}