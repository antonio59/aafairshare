
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
