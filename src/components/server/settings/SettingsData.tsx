import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Category, CategoryGroup, Tag, RecurringExpense, UserSettings } from '@/types';

async function getSettingsData() {
  const supabase = createServerClient({ cookies });
  
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
    supabase.from('recurring_expenses').select('*').order('nextDueDate'),
    supabase.from('user_settings').select('*').single()
  ]);

  if (categoriesError) throw new Error('Failed to fetch categories');
  if (groupsError) throw new Error('Failed to fetch category groups');
  if (tagsError) throw new Error('Failed to fetch tags');
  if (recurringError) throw new Error('Failed to fetch recurring expenses');
  if (settingsError && settingsError.code !== 'PGRST116') { // No rows returned is ok
    throw new Error('Failed to fetch user settings');
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
    userSettings: userSettings || getDefaultUserSettings(),
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
    if (exp.frequency === 'monthly') return sum + exp.amount;
    if (exp.frequency === 'yearly') return sum + (exp.amount / 12);
    if (exp.frequency === 'weekly') return sum + (exp.amount * 52 / 12);
    return sum;
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
    theme: 'light',
    currency: 'GBP',
    defaultSplit: 'equal',
    notifications: {
      email: true,
      push: false,
      recurring: true
    },
    displayPreferences: {
      defaultView: 'list',
      showTags: true,
      showNotes: true
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
