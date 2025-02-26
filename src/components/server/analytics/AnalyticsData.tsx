import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import type { Expense, Category, CategoryGroup, Tag } from '@/types';

interface AnalyticsInsights {
  totalSpent: number;
  averageExpense: number;
  expenseCount: number;
  monthlyTrend: {
    labels: string[];
    data: number[];
  };
  categoryBreakdown: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  tagAnalysis: {
    labels: string[];
    data: number[];
  };
  splitAnalysis: {
    labels: string[];
    data: number[];
  };
}

export interface AnalyticsData {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  insights: AnalyticsInsights;
  dateRange: string;
  startDate: string;
  endDate: string;
}

async function getAnalyticsData(timeRange: string = 'current') {
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
  
  // Calculate date range
  const now = new Date();
  let startDate = startOfMonth(now);
  let endDate = endOfMonth(now);
  
  switch (timeRange) {
    case 'last':
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      break;
    case '3':
      startDate = startOfMonth(subMonths(now, 3));
      break;
    case '6':
      startDate = startOfMonth(subMonths(now, 6));
      break;
    case '12':
      startDate = startOfMonth(subMonths(now, 12));
      break;
  }

  // Fetch all required data
  const [
    { data: expenses, error: expensesError },
    { data: categories, error: categoriesError },
    { data: categoryGroups, error: groupsError },
    { data: tags, error: tagsError }
  ] = await Promise.all([
    supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString()),
    supabase.from('categories').select('*'),
    supabase.from('category_groups').select('*'),
    supabase.from('tags').select('*')
  ]);

  if (expensesError) throw new Error('Failed to fetch expenses');
  if (categoriesError) throw new Error('Failed to fetch categories');
  if (groupsError) throw new Error('Failed to fetch category groups');
  if (tagsError) throw new Error('Failed to fetch tags');

  // Calculate insights
  const insights: AnalyticsInsights = calculateInsights(
    expenses as Expense[],
    categories as Category[],
    tags as Tag[],
    startDate,
    endDate
  );

  return {
    expenses,
    categories,
    categoryGroups,
    tags,
    insights,
    dateRange: timeRange,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

function calculateInsights(
  expenses: Expense[],
  categories: Category[],
  tags: Tag[],
  startDate: Date,
  endDate: Date
): AnalyticsInsights {
  // Calculate basic metrics
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense = totalSpent / (expenses.length || 1);
  const expenseCount = expenses.length;

  // Calculate monthly trend
  const monthlyTrend = calculateMonthlyTrend(expenses, startDate, endDate);

  // Calculate category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(expenses, categories);

  // Calculate tag analysis
  const tagAnalysis = calculateTagAnalysis(expenses, tags);

  // Calculate split analysis
  const splitAnalysis = calculateSplitAnalysis(expenses);

  return {
    totalSpent,
    averageExpense,
    expenseCount,
    ...monthlyTrend,
    ...categoryBreakdown,
    ...tagAnalysis,
    ...splitAnalysis,
  };
}

function calculateMonthlyTrend(expenses: Expense[], startDate: Date, endDate: Date) {
  const months: { [key: string]: number } = {};
  let current = startDate;
  
  while (current <= endDate) {
    const monthKey = format(current, 'yyyy-MM');
    months[monthKey] = 0;
    current = endOfMonth(subMonths(current, -1));
  }

  expenses.forEach(expense => {
    const monthKey = format(new Date(expense.date), 'yyyy-MM');
    if (months[monthKey] !== undefined) {
      months[monthKey] += expense.amount;
    }
  });

  return {
    monthlyTrend: {
      labels: Object.keys(months).map(date => format(new Date(date), 'MMM yyyy')),
      data: Object.values(months),
    }
  };
}

function calculateCategoryBreakdown(expenses: Expense[], categories: Category[]) {
  const breakdown: { [key: string]: { amount: number; color: string } } = {};

  expenses.forEach(expense => {
    const category = categories.find(c => c.id === expense.category);
    if (category) {
      if (!breakdown[category.name]) {
        breakdown[category.name] = { amount: 0, color: category.color };
      }
      breakdown[category.name].amount += expense.amount;
    }
  });

  return {
    categoryBreakdown: {
      labels: Object.keys(breakdown),
      data: Object.values(breakdown).map(v => v.amount),
      colors: Object.values(breakdown).map(v => v.color),
    }
  };
}

function calculateTagAnalysis(expenses: Expense[], tags: Tag[]) {
  const tagTotals: { [key: string]: number } = {};

  expenses.forEach(expense => {
    if (expense.tags) {
      expense.tags.forEach(tagId => {
        const tag = tags.find(t => t.id === tagId);
        if (tag) {
          tagTotals[tag.name] = (tagTotals[tag.name] || 0) + expense.amount;
        }
      });
    }
  });

  const sortedTags = Object.entries(tagTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return {
    tagAnalysis: {
      labels: sortedTags.map(([name]) => name),
      data: sortedTags.map(([, value]) => value),
    }
  };
}

function calculateSplitAnalysis(expenses: Expense[]) {
  const totals = {
    Andres: { paid: 0, share: 0 },
    Antonio: { paid: 0, share: 0 }
  };

  expenses.forEach(expense => {
    const amount = expense.amount;
    
    // Track who paid
    if (expense.paidBy === 'Andres') {
      totals.Andres.paid += amount;
    } else {
      totals.Antonio.paid += amount;
    }

    // Calculate shares
    if (expense.split === 'equal') {
      totals.Andres.share += amount / 2;
      totals.Antonio.share += amount / 2;
    } else {
      if (expense.paidBy === 'Andres') {
        totals.Antonio.share += amount;
      } else {
        totals.Andres.share += amount;
      }
    }
  });

  return {
    splitAnalysis: {
      labels: ['Amount Paid', 'Share of Expenses'],
      data: [
        totals.Andres.paid,
        totals.Antonio.paid,
        totals.Andres.share,
        totals.Antonio.share,
      ],
    }
  };
}

export async function AnalyticsData({ timeRange = 'current' }) {
  const data = await getAnalyticsData(timeRange);

  // This component doesn't render anything visible
  // It just provides data to its client components
  return (
    <script
      type="application/json"
      id="analytics-data"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
