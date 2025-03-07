import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Budget, Category, Expense } from '@/types';

async function getBudgetData() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Server component doesn't need to set cookies
        },
        remove(name: string, options: any) {
          // Server component doesn't need to remove cookies
        },
      },
    }
  );
  
  // Fetch budgets
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false });

  if (budgetsError) throw new Error('Failed to fetch budgets');

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*');

  if (categoriesError) throw new Error('Failed to fetch categories');

  // Fetch category groups
  const { data: categoryGroups, error: groupsError } = await supabase
    .from('category_groups')
    .select('*');

  if (groupsError) throw new Error('Failed to fetch category groups');

  return {
    budgets,
    categories,
    categoryGroups,
  };
}

export async function BudgetData() {
  const { budgets, categories, categoryGroups } = await getBudgetData();

  // This component doesn't render anything visible
  // It just provides data to its client components
  return (
    <script
      type="application/json"
      id="budget-data"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          budgets,
          categories,
          categoryGroups,
        }),
      }}
    />
  );
}
