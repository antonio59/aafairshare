import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Category, CategoryGroup, Tag, UserSettings } from '@/types';

export interface RecurringExpense {
  id: string;
  description?: string | null;
  amount: number;
  category_id: string | null;
  paid_by: string;
  split: any; // Json type
  start_date: string;
  frequency: string; // 'monthly' | 'quarterly' | 'yearly' | 'weekly'
  day_of_month: number;
  tags: string[] | null;
  last_processed?: string | null;
  next_due_date?: string | null;
  created_at?: string;
  updated_at?: string | null;
  user_id?: string | null;
}

async function getSettingsData() {
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
  
  // Fetch all settings data in parallel
  const [
    { data: categories, error: categoriesError },
    { data: categoryGroups, error: groupsError },
    { data: tags, error: tagsError },
    { data: recurringExpenses, error: recurringError },
    { data: userSettings, error: settingsError }
  ] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('category_groups').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('recurring_expenses').select('*').order('next_due_date'),
    supabase.from('user_settings').select('*').single()
  ]);

  if (categoriesError) throw new Error('Failed to fetch categories');
  if (groupsError) throw new Error('Failed to fetch category groups');
  if (tagsError) throw new Error('Failed to fetch tags');
  if (recurringError) throw new Error('Failed to fetch recurring expenses');
  if (settingsError && settingsError.code !== 'PGRST116') { // No rows returned is ok
    throw new Error('Failed to fetch user settings');
  }

  // Process user settings
  const processedUserSettings = {
    currency: 'USD',
    language: 'en',
    theme: 'light',
    notifications: {
      enabled: true,
      email: true,
      push: false,
      frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
      recurring: true
    },
    defaultView: 'list',
    defaultCategory: categories[0]?.id || '',
    defaultCategoryGroup: categoryGroups[0]?.id || '',
    defaultPaidBy: 'Antonio',
    expenseReminders: true,
    settlementReminders: true,
    budgetAlerts: true,
    dateFormat: 'MM/DD/YYYY',
    weekStart: 'Sunday',
  };

  // Merge processed user settings with fetched user settings
  const mergedUserSettings = { ...processedUserSettings, ...userSettings };

  // Notification frequency check
  if (
    mergedUserSettings.notifications.frequency !== 'daily' &&
    mergedUserSettings.notifications.frequency !== 'weekly' &&
    mergedUserSettings.notifications.frequency !== 'monthly' &&
    mergedUserSettings.notifications.frequency !== 'quarterly'
  ) {
    mergedUserSettings.notifications.frequency = 'weekly';
  }

  // Calculate statistics and relationships
  const stats = calculateSettingsStats({
    categories: categories || [],
    categoryGroups: categoryGroups || [],
    tags: tags || [],
    recurringExpenses: recurringExpenses || []
  });

  return {
    categories,
    categoryGroups,
    tags,
    recurringExpenses,
    userSettings: mergedUserSettings,
    stats
  };
}

function calculateSettingsStats({
  categories,
  categoryGroups,
  tags,
  recurringExpenses
}: {
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  recurringExpenses: RecurringExpense[];
}) {
  // Categories by group
  const categoriesByGroup = categories.reduce((acc, cat) => {
    const group = categoryGroups.find(g => g.id === cat.groupId);
    if (group) {
      acc[group.id] = acc[group.id] || [];
      acc[group.id].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

  // Calculate monthly recurring total
  const monthlyRecurringTotal = recurringExpenses.reduce((sum, exp) => {
    switch (exp.frequency) {
      case 'monthly':
        return sum + exp.amount;
      case 'yearly':
        return sum + (exp.amount / 12);
      case 'weekly':
        return sum + (exp.amount * 52 / 12);
      case 'quarterly':
        return sum + (exp.amount * 4 / 12);
      default:
        return sum;
    }
  }, 0);

  return {
    totalCategories: categories.length,
    totalGroups: categoryGroups.length,
    totalTags: tags.length,
    totalRecurring: recurringExpenses.length,
    categoriesByGroup,
    monthlyRecurringTotal
  };
}

function getDefaultUserSettings(): UserSettings {
  return {
    id: '',
    userId: '',
    theme: 'light',
    currency: 'GBP',
    language: 'en',
    notificationFrequency: 'weekly',
    emailNotifications: true,
    pushNotifications: false,
    defaultSplit: 'equal',
    notifications: {
      email: true,
      push: false,
      inApp: true,
      recurring: true
    }
  };
}

export async function SettingsData() {
  const data = await getSettingsData();

  // This component doesn't render anything visible
  // It just provides data to its client components
  return (
    <script
      type="application/json"
      id="settings-data"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
