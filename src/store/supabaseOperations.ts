import { supabase } from '@/supabase';
import type { 
  Expense, 
  Category, 
  CategoryGroup, 
  Tag, 
  Budget, 
  BudgetHistory, 
  RecurringExpense, 
  Settlement 
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Supabase Data interface
export interface SupabaseData {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  budgets: Budget[];
  budgetHistory: BudgetHistory[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
}

// Helper functions
export const dateToISOString = (dateStr: string) => new Date(dateStr).toISOString();

// Budget History Operations
export const addBudgetHistory = async (history: BudgetHistory) => {
  const { data, error } = await supabase
    .from('budget_history')
    .insert({ ...history, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Budget Operations
export const addBudget = async (budget: Budget) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateBudget = async (id: string, budget: Partial<Budget>) => {
  const { data, error } = await supabase
    .from('budgets')
    .update(budget)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteBudget = async (id: string) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Category Operations
export const addCategory = async (category: Category) => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Category Group Operations
export const addCategoryGroup = async (group: CategoryGroup) => {
  const { data, error } = await supabase
    .from('category_groups')
    .insert(group)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateCategoryGroup = async (id: string, group: Partial<CategoryGroup>) => {
  const { data, error } = await supabase
    .from('category_groups')
    .update(group)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteCategoryGroup = async (id: string) => {
  // First, update all categories in this group to have no group
  await supabase
    .from('categories')
    .update({ group_id: null })
    .eq('group_id', id);

  // Then delete the group
  const { error } = await supabase
    .from('category_groups')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Tag Operations
export const addTag = async (tag: Tag) => {
  const { data, error } = await supabase
    .from('tags')
    .insert(tag)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTag = async (id: string, tag: Partial<Tag>) => {
  const { data, error } = await supabase
    .from('tags')
    .update(tag)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTag = async (id: string) => {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Expense Operations
export const addExpense = async (expense: Expense) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expense, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateExpense = async (id: string, expense: Partial<Expense>) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({ ...expense, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Recurring Expense Operations
export const addRecurringExpense = async (expense: RecurringExpense) => {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert({ ...expense, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateRecurringExpense = async (id: string, expense: Partial<RecurringExpense>) => {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .update({ ...expense, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteRecurringExpense = async (id: string) => {
  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Settlement Operations
export const addSettlement = async (settlement: Settlement) => {
  const { data, error } = await supabase
    .from('settlements')
    .insert({ ...settlement, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Fetch all data with improved error handling and data validation
export const fetchAllData = async (): Promise<SupabaseData> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('No authenticated user');

    const [
      { data: expenses, error: expensesError },
      { data: categories, error: categoriesError },
      { data: categoryGroups, error: categoryGroupsError },
      { data: tags, error: tagsError },
      { data: budgets, error: budgetsError },
      { data: budgetHistory, error: budgetHistoryError },
      { data: recurringExpenses, error: recurringExpensesError },
      { data: settlements, error: settlementsError }
    ] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('categories').select('*').eq('user_id', userId),
      supabase.from('category_groups').select('*').eq('user_id', userId),
      supabase.from('tags').select('*').eq('user_id', userId),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('budget_history').select('*').eq('user_id', userId),
      supabase.from('recurring_expenses').select('*').eq('user_id', userId),
      supabase.from('settlements').select('*').eq('user_id', userId)
    ]);

    // Check for errors
    if (expensesError) throw expensesError;
    if (categoriesError) throw categoriesError;
    if (categoryGroupsError) throw categoryGroupsError;
    if (tagsError) throw tagsError;
    if (budgetsError) throw budgetsError;
    if (budgetHistoryError) throw budgetHistoryError;
    if (recurringExpensesError) throw recurringExpensesError;
    if (settlementsError) throw settlementsError;

    return {
      expenses: expenses || [],
      categories: categories || [],
      categoryGroups: categoryGroups || [],
      tags: tags || [],
      budgets: budgets || [],
      budgetHistory: budgetHistory || [],
      recurringExpenses: recurringExpenses || [],
      settlements: settlements || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
