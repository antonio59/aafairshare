import { createServerSupabaseClient } from '@/lib/supabase-server';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import type { Expense, Category, CategoryGroup, Tag } from '@/types';

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
  const supabase = await createServerSupabaseClient();
  
  // Build the base query
  let query = supabase
    .from('expenses')
    .select(`
      *,
      categories(*)
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
    query = query.in('category_id', filters.categories);
  }
  if (filters.paidBy?.length) {
    query = query.in('paid_by', filters.paidBy);
  }
  if (filters.minAmount !== undefined) {
    query = query.gte('amount', filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    query = query.lte('amount', filters.maxAmount);
  }
  if (filters.tags?.length) {
    // For array columns, we use the contains operator
    // This assumes tags is stored as an array in the database
    query = query.overlaps('tags', filters.tags);
  }

  const { data: dbExpenses, error } = await query;

  if (error) {
    console.error('Error fetching expenses:', error);
    return {
      expenses: [],
      stats: null,
      error: error.message
    };
  }

  // Transform database expenses to frontend format
  const expenses: Expense[] = (dbExpenses || []).map(expense => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    created_at: expense.created_at,
    updated_at: expense.updated_at,
    paidBy: expense.paid_by,
    paid_by: expense.paid_by,
    split: expense.split,
    category_id: expense.category_id,
    category: expense.categories ? expense.categories : { id: '', name: 'Uncategorized' },
    tags: expense.tags || [],
    notes: expense.notes,
    recurring: expense.recurring || false,
    recurring_frequency: expense.recurring_frequency,
    receipt_url: expense.receipt_url
  }));

  // Calculate statistics
  const stats = calculateExpenseStats(expenses);

  return {
    expenses,
    stats,
    error: null
  };
}

function calculateExpenseStats(expenses: Expense[]) {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageAmount = totalAmount / (expenses.length || 1);

  const byCategory = expenses.reduce((acc, exp) => {
    const categoryName = typeof exp.category === 'string' ? exp.category : exp.category?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const byPaidBy = expenses.reduce((acc, exp) => {
    acc[exp.paidBy] = (acc[exp.paidBy] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const byMonth = expenses.reduce((acc, exp) => {
    const month = format(new Date(exp.date), 'yyyy-MM');
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

// This function should be updated if there are recurring expenses in the database schema
async function getRecurringExpenses() {
  const supabase = await createServerSupabaseClient();
  
  // Use the expenses table and filter for recurring expenses
  const { data: recurring, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('recurring', true)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching recurring expenses:', error);
    return { recurringExpenses: [], error: error.message };
  }

  return { recurringExpenses: recurring || [], error: null };
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
          recurringExpenses: recurringExpenses.recurringExpenses,
        }),
      }}
    />
  );
}
