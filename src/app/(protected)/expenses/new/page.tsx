import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

import { NewExpenseForm } from '@/components/expenses/NewExpenseForm';

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Add New Expense | AA Fair Share',
  description: 'Create a new expense entry',
};

export default async function NewExpensePage() {
  // Create Supabase client
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

  // Get categories for the form
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, category:category, color')
    .order('category');
    
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
  }

  // Get friends/users for the form
  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .order('name');

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Expense</h1>
      <NewExpenseForm 
        userId={session.user.id}
        categories={categories || []} 
        users={users || []}
      />
    </div>
  );
}
