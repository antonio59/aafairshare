
import { Expense, MonthData, AnalyticsData, CategorySummary, LocationSummary } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

// Fetch users from the Supabase database
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, photo_url');
  
  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
  
  return data.map(user => ({
    id: user.id,
    name: user.username || user.email.split('@')[0],
    avatar: user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.email}`
  }));
};

// Get all categories from Supabase
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, color, icon');
    
  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
  
  return data;
};

// Get all locations from Supabase
export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name');
    
  if (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
  
  return data;
};

// Format month string for database queries
const formatMonthString = (year: number, month: number) => {
  return `${year}-${month.toString().padStart(2, '0')}`;
};

// Get month data including expenses
export const getMonthData = async (year: number, month: number): Promise<MonthData> => {
  try {
    // Get expenses for the specified month
    const monthString = formatMonthString(year, month);
    console.log(`Fetching expenses for month: ${monthString}`);
    
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select(`
        id, 
        amount, 
        date,
        description,
        split_type,
        paid_by_id,
        category_id (id, name),
        location_id (id, name)
      `)
      .eq('month', monthString)
      .order('date', { ascending: false });
      
    if (expensesError) {
      console.error("Error fetching expenses:", expensesError);
      throw expensesError;
    }

    console.log(`Found ${expenses.length} expenses for month ${monthString}`);

    // Get users for attribution
    const { data: users } = await supabase
      .from('users')
      .select('id, username, email');
    
    // Map the data to match our Expense type
    const mappedExpenses: Expense[] = expenses.map(exp => ({
      id: exp.id,
      amount: Number(exp.amount),
      date: exp.date,
      category: exp.category_id?.name || "Uncategorized",
      location: exp.location_id?.name || "Unknown",
      description: exp.description || "",
      paidBy: exp.paid_by_id || "",
      split: exp.split_type || "50/50"
    }));

    // Calculate totals
    const totalExpenses = mappedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const fairShare = totalExpenses / 2;

    // Calculate what each user paid
    const user1 = users && users[0] ? users[0].id : "";
    const user2 = users && users[1] ? users[1].id : "";
    
    const user1Paid = mappedExpenses.filter(e => e.paidBy === user1).reduce((sum, exp) => sum + exp.amount, 0);
    const user2Paid = mappedExpenses.filter(e => e.paidBy === user2).reduce((sum, exp) => sum + exp.amount, 0);
    
    // Determine who owes whom
    const user1Owes = fairShare - user1Paid;
    let settlement = Math.abs(user1Owes);
    let settlementDirection: 'owes' | 'owed' | 'even' = 'even';
    
    if (user1Owes > 0) {
      settlementDirection = 'owes'; // User 1 owes User 2
    } else if (user1Owes < 0) {
      settlementDirection = 'owed'; // User 2 owes User 1
    }

    return {
      totalExpenses,
      fairShare,
      settlement,
      settlementDirection,
      user1Paid,
      user2Paid,
      expenses: mappedExpenses
    };
  } catch (error) {
    console.error("Error fetching month data:", error);
    throw error;
  }
};

// Get analytics data
export const getAnalyticsData = async (year: number, month: number): Promise<AnalyticsData> => {
  try {
    // Get month data first (includes expenses)
    const monthData = await getMonthData(year, month);
    const { expenses, user1Paid, user2Paid, totalExpenses } = monthData;
    
    // Calculate category breakdown
    const categoryMap = new Map<string, number>();
    expenses.forEach(expense => {
      const category = expense.category || "Uncategorized";
      categoryMap.set(category, (categoryMap.get(category) || 0) + expense.amount);
    });
    
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / totalExpenses) * 100)
    }));
    
    // Calculate location breakdown
    const locationMap = new Map<string, number>();
    expenses.forEach(expense => {
      const location = expense.location || "Unknown";
      locationMap.set(location, (locationMap.get(location) || 0) + expense.amount);
    });
    
    const locationBreakdown = Array.from(locationMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / totalExpenses) * 100)
    }));

    // Get user comparison
    const userComparison = {
      user1Percentage: totalExpenses ? Math.round((user1Paid / totalExpenses) * 100) : 0,
      user2Percentage: totalExpenses ? Math.round((user2Paid / totalExpenses) * 100) : 0,
    };
    
    // Get expense trends (past few months)
    // This is a placeholder - in a real implementation, we'd query multiple months
    const trends = [
      { month: format(new Date(year, month - 1, 1), "MMM"), total: totalExpenses, user1: user1Paid, user2: user2Paid },
      // We'd typically fetch previous months here
    ];
    
    return {
      userComparison,
      categoryBreakdown,
      locationBreakdown,
      trends
    };
  } catch (error) {
    console.error("Error generating analytics data:", error);
    throw error;
  }
};

// Add new expense
export const addExpense = async (expense: Omit<Expense, "id">): Promise<Expense> => {
  try {
    // First, we need to look up or create category and location
    let categoryId;
    let locationId;
    
    // Look up or create category
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', expense.category)
      .single();
      
    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      const { data: newCategory } = await supabase
        .from('categories')
        .insert({ name: expense.category })
        .select('id')
        .single();
      categoryId = newCategory?.id;
    }
    
    // Look up or create location
    const { data: existingLocation } = await supabase
      .from('locations')
      .select('id')
      .eq('name', expense.location)
      .single();
      
    if (existingLocation) {
      locationId = existingLocation.id;
    } else {
      const { data: newLocation } = await supabase
        .from('locations')
        .insert({ name: expense.location })
        .select('id')
        .single();
      locationId = newLocation?.id;
    }

    // Determine month string (YYYY-MM)
    const expenseDate = parseISO(expense.date);
    const monthString = format(expenseDate, 'yyyy-MM');
    
    // Insert the expense
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        amount: expense.amount,
        date: expense.date,
        month: monthString,
        description: expense.description,
        paid_by_id: expense.paidBy,
        category_id: categoryId,
        location_id: locationId,
        split_type: expense.split
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      ...expense
    };
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

// Mark settlement as completed
export const markSettlementComplete = async (year: number, month: number, amount: number, fromUserId: string, toUserId: string): Promise<void> => {
  try {
    const monthString = formatMonthString(year, month);
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    
    // Insert a new settlement record
    const { error } = await supabase
      .from('settlements')
      .insert({
        month: monthString,
        date: currentDate,
        amount: amount,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'completed',
        recorded_by: fromUserId // Assuming the person who owes is marking it as settled
      });
    
    if (error) throw error;
    
  } catch (error) {
    console.error("Error marking settlement as completed:", error);
    throw error;
  }
};

// Create new location
export const createLocation = async (name: string): Promise<{ id: string, name: string }> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .insert({ name })
      .select('id, name')
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
};

// Create new category
export const createCategory = async (name: string, icon?: string, color?: string): Promise<{ id: string, name: string, icon?: string, color?: string }> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, icon, color })
      .select('id, name, icon, color')
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Delete location
export const deleteLocation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Function to get the current month data for display
export const getCurrentMonthLabel = (): string => {
  const date = new Date();
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1; // JavaScript months are 0-indexed
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

// Export data to CSV
export const exportToCSV = (data: Expense[], year: number, month: number): string => {
  // Create CSV header
  const headers = ['Date', 'Category', 'Location', 'Description', 'Amount', 'Paid By', 'Split'];
  
  // Format data rows
  const rows = data.map(expense => [
    expense.date,
    expense.category,
    expense.location,
    expense.description,
    expense.amount.toString(),
    expense.paidBy === "1" ? "User1" : "User2",
    expense.split
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Download as CSV
export const downloadCSV = (expenses: Expense[], year: number, month: number): void => {
  const csvContent = exportToCSV(expenses, year, month);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${monthName}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
