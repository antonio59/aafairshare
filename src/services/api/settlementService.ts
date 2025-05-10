
import { supabase } from "@/integrations/supabase/client";
import { formatMonthString } from "../utils/dateUtils";
import { format } from "date-fns";

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
        amount: Math.ceil(amount), // Round up the settlement amount
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

// Mark settlement as unsettled (delete the settlement record)
export const markSettlementUnsettled = async (month: string): Promise<void> => {
  try {
    // Delete the settlement record for the specified month
    const { error } = await supabase
      .from('settlements')
      .delete()
      .eq('month', month);
    
    if (error) throw error;
    
  } catch (error) {
    console.error("Error marking settlement as unsettled:", error);
    throw error;
  }
};

// Check if a settlement exists for a given month
export const checkSettlementExists = async (month: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .select('id')
      .eq('month', month)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking settlement existence:", error);
    throw error;
  }
};
