
import { cookies } from 'next/headers';
import { format, parseISO } from 'date-fns';
import type { Expense } from '@/types';

interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  tags?: string[];
  paidBy?: string[];
  minAmount?: number;
  maxAmount?: number;
}

async function getExpensesData(filters: ExpenseFilters = {}) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
  
  // Build the base query
  let query = supabase
    .from('expenses')
    .select(`
      *,
      categories (*),
      tags (*)
    `)
    .order('date', { ascending: false });

  // Apply filters
  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate);
  }
  if (filters.categories?.length) {
    query = query.in('category', filters.categories);
  }
  if (filters.paidBy?.length) {
    query = query.in('paidBy', filters.paidBy);
  }
  if (filters.minAmount !== undefined) {
    query = query.gte('amount', filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    query = query.lte('amount', filters.maxAmount);
  }

  // Fetch all required data in parallel
  const [
    { data: expenses, error: expensesError },
    { data: categories, error: categoriesError },
    { data: categoryGroups, error: groupsError },
    { data: tags, error: tagsError }
  ] = await Promise.all([
    query,
    supabase.from('categories').select('*'),
    supabase.from('category_groups').select('*'),
    supabase.from('tags').select('*')
  ]);

  if (expensesError) throw new Error('Failed to fetch expenses');
  if (categoriesError) throw new Error('Failed to fetch categories');
  if (groupsError) throw new Error('Failed to fetch category groups');
  if (tagsError) throw new Error('Failed to fetch tags');

  // Calculate summary statistics
  const stats = calculateExpenseStats(expenses);

  return {
    expenses,
    categories,
    categoryGroups,
    tags,
    stats,
  };
}

function calculateExpenseStats(expenses: Expense[]) {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageAmount = totalAmount / (expenses.length || 1);

  const byCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const byPaidBy = expenses.reduce((acc, exp) => {
    acc[exp.paidBy] = (acc[exp.paidBy] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const byMonth = expenses.reduce((acc, exp) => {
    const month = format(parseISO(exp.date), 'yyyy-MM');
    acc[month] = (acc[month] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalAmount,
    averageAmount,
    expenseCount: expenses.length,
    byCategory,
    byPaidBy,
    byMonth,
  };
}

async function getRecurringExpenses() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
  
  const { data: recurring, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .order('nextDueDate', { ascending: true });

  if (error) throw new Error('Failed to fetch recurring expenses');

  return recurring;
}

export async function ExpensesData({ filters }: { filters?: ExpenseFilters }) {
  const [expensesData, recurringExpenses] = await Promise.all([
    getExpensesData(filters),
    getRecurringExpenses(),
  ]);

  // This component doesn't render anything visible
  // It just provides data to its client components
  return (
    <script
      type="application/json"
      id="expenses-data"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          ...expensesData,
          recurringExpenses,
        }),
      }}
    />
  );
}
