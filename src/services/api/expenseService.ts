
import { Expense } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { formatMonthString } from "../utils/dateUtils";

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
