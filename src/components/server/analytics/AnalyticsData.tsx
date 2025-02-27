import { createServerSupabaseClient } from '@/lib/supabase-server';
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

interface AnalyticsData {
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
  const supabase = await createServerSupabaseClient();
  
  // Determine date range
  let startDate: Date;
  let endDate: Date;
  let dateRange: string;
  
  const today = new Date();
  
  switch (timeRange) {
    case 'current':
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      dateRange = format(startDate, 'MMMM yyyy');
      break;
    case 'last':
      startDate = startOfMonth(subMonths(today, 1));
      endDate = endOfMonth(subMonths(today, 1));
      dateRange = format(startDate, 'MMMM yyyy');
      break;
    case 'year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      dateRange = `${today.getFullYear()}`;
      break;
    default:
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      dateRange = format(startDate, 'MMMM yyyy');
  }
  
  // Fetch all required data in parallel
  const [
    { data: expensesData, error: expensesError },
    { data: categoriesData, error: categoriesError },
    { data: groupsData, error: groupsError },
    { data: tagsData, error: tagsError }
  ] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, categories(*)')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    supabase.from('categories').select('*'),
    supabase.from('category_groups').select('*'),
    supabase.from('tags').select('*')
  ]);
  
  if (expensesError) throw new Error('Failed to fetch expenses: ' + expensesError.message);
  if (categoriesError) throw new Error('Failed to fetch categories: ' + categoriesError.message);
  if (groupsError) throw new Error('Failed to fetch category groups: ' + groupsError.message);
  if (tagsError) throw new Error('Failed to fetch tags: ' + tagsError.message);
  
  // Transform data to expected format
  const expenses: Expense[] = (expensesData || []).map(expense => ({
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
  
  // Map categories with the required frontend structure
  const categories: Category[] = (categoriesData || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    created_at: cat.created_at,
    category_group_id: cat.category_group_id,
    groupId: cat.category_group_id // Set groupId for frontend compatibility
  }));
  
  // Map tags
  const tags: Tag[] = (tagsData || []).map(tag => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    created_at: tag.created_at
  }));
  
  // Map category groups
  const groups: CategoryGroup[] = (groupsData || []).map(group => ({
    id: group.id,
    name: group.name,
    created_at: group.created_at
  }));
  
  // Calculate insights
  const insights: AnalyticsInsights = calculateInsights(
    expenses,
    categories,
    tags,
    startDate,
    endDate
  );
  
  return {
    expenses,
    categories,
    categoryGroups: groups,
    tags,
    insights,
    dateRange,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
}

function calculateInsights(
  expenses: Expense[],
  categories: Category[],
  tags: Tag[],
  startDate: Date,
  endDate: Date
): AnalyticsInsights {
  // Calculate total spent
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate average expense
  const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
  
  // Generate monthly trend data
  const monthlyData: Record<string, number> = {};
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthKey = format(currentDate, 'yyyy-MM');
    monthlyData[monthKey] = 0;
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  expenses.forEach(exp => {
    const expDate = new Date(exp.date);
    const monthKey = format(expDate, 'yyyy-MM');
    if (monthlyData[monthKey] !== undefined) {
      monthlyData[monthKey] += exp.amount;
    }
  });
  
  // Calculate category breakdown
  const categoryData: Record<string, number> = {};
  const categoryColors: Record<string, string> = {};
  
  categories.forEach(cat => {
    categoryData[cat.name] = 0;
    categoryColors[cat.name] = cat.color || '#cccccc';
  });
  
  expenses.forEach(exp => {
    const categoryName = typeof exp.category === 'string' ? exp.category : exp.category?.name || 'Uncategorized';
    categoryData[categoryName] = (categoryData[categoryName] || 0) + exp.amount;
  });
  
  // Calculate tag analysis
  const tagData: Record<string, number> = {};
  
  expenses.forEach(exp => {
    if (Array.isArray(exp.tags)) {
      (exp.tags as string[]).forEach(tagId => {
        const tag = tags.find(t => t.id === tagId);
        if (tag) {
          tagData[tag.name] = (tagData[tag.name] || 0) + exp.amount;
        }
      });
    }
  });
  
  // Calculate split analysis
  const splitData: Record<string, number> = {};
  
  expenses.forEach(exp => {
    const splitType = typeof exp.split === 'string' ? exp.split : 'custom';
    splitData[splitType] = (splitData[splitType] || 0) + exp.amount;
  });
  
  return {
    totalSpent,
    averageExpense,
    expenseCount: expenses.length,
    monthlyTrend: {
      labels: Object.keys(monthlyData),
      data: Object.values(monthlyData),
    },
    categoryBreakdown: {
      labels: Object.keys(categoryData),
      data: Object.values(categoryData),
      colors: Object.keys(categoryData).map(cat => categoryColors[cat] || '#cccccc'),
    },
    tagAnalysis: {
      labels: Object.keys(tagData),
      data: Object.values(tagData),
    },
    splitAnalysis: {
      labels: Object.keys(splitData),
      data: Object.values(splitData),
    },
  };
}

export async function AnalyticsData({ timeRange = 'current' }: { timeRange?: string }) {
  const data = await getAnalyticsData(timeRange);
  
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
