import { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ExpensesDashboardWrapper } from '@/components/client/ExpensesDashboardWrapper';

// Use Next.js 15 compatible type definition
interface PageProps {
  params: Record<string, string>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  // Create Supabase client - cookie handling is managed by middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(_name: string) {
          // Let middleware handle cookie management
          return null;
        },
        set(_name: string, _value: string) {
          // No-op: cookie setting handled by middleware
        },
        remove(_name: string) {
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

  // Extract month param, ensuring we get a string or undefined
  const month = searchParams.month ? 
    (Array.isArray(searchParams.month) ? searchParams.month[0] : searchParams.month) : 
    undefined;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <ExpensesDashboardWrapper initialMonth={month} />
      </Suspense>
    </div>
  );
}