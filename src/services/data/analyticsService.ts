
import { MonthData, AnalyticsData } from "@/types";
import { getMonthData } from "./monthDataService";

// Get analytics data
export const getAnalyticsData = async (year: number, month: number): Promise<AnalyticsData> => {
  try {
    // Get month data first (includes expenses)
    const monthData = await getMonthData(year, month);
    const { expenses, user1Paid, user2Paid, totalExpenses, settlement, settlementDirection } = monthData;
    
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
    
    return {
      userComparison,
      categoryBreakdown,
      locationBreakdown,
      fairShare: totalExpenses / 2,
      totalExpenses,
      settlement,
      settlementDirection
    };
  } catch (error) {
    console.error("Error generating analytics data:", error);
    throw error;
  }
};
