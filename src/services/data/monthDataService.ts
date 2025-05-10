
import { Expense, MonthData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { formatMonthString } from "../utils/dateUtils";

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
