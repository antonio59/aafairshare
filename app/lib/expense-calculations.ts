import { Expense, User } from "~/shared/schema";

// Define a specific type for the settlement summary data
export interface SettlementSummary {
  month: string;
  totalExpenses: number;
  userExpenses: Record<string, number>; // { userId: amount }
  settlementAmount: number;
  settlementDirection: { fromUserId: string; toUserId: string } | null;
}

/**
 * Calculate settlement details between two users based on expenses
 * @param expenses - List of expenses for the month
 * @param users - List of users (should be exactly 2 users)
 * @param currentMonth - Current month in YYYY-MM format
 * @returns Settlement summary with amount and direction
 */
export function calculateSettlement(
  expenses: Expense[],
  users: User[],
  currentMonth: string
): SettlementSummary | null {
  // Validate input
  if (!expenses || !users || users.length !== 2) {
    console.error("Invalid input for settlement calculation", { expenses, users });
    return null;
  }

  const [user1, user2] = users;

  let totalExpenses = 0; // Keep total for display
  let totalSplitExpenses = 0;
  const userExpensesPaid: Record<string, number> = { [user1.id]: 0, [user2.id]: 0 };
  let user1_paid_50_50 = 0;
  let user1_paid_100_owed_by_other = 0; // User1 paid, User2 owes User1
  let user2_paid_100_owed_by_other = 0; // User2 paid, User1 owes User2

  expenses.forEach(exp => {
    const amount = Number(exp.amount) || 0;
    totalExpenses += amount; // Calculate total overall expenses

    // Track who paid what
    if (exp.paidByUserId === user1.id) userExpensesPaid[user1.id] += amount;
    else if (exp.paidByUserId === user2.id) userExpensesPaid[user2.id] += amount;

    // Handle different split types for balance calculation
    // Default to "50/50" if splitType is missing or null
    const splitType = exp.splitType || "50/50";

    if (splitType === "50/50") {
      totalSplitExpenses += amount;
      if (exp.paidByUserId === user1.id) {
        user1_paid_50_50 += amount;
      }
    } else if (splitType === "100%") {
      // Assumption: If split is 100%, the person who *didn't* pay owes the full amount.
      if (exp.paidByUserId === user1.id) {
        // User1 paid, so User2 owes User1 this amount
        user1_paid_100_owed_by_other += amount;
      } else if (exp.paidByUserId === user2.id) {
        // User2 paid, so User1 owes User2 this amount
        user2_paid_100_owed_by_other += amount;
      }
    }
    // Add handling for other split types if they exist
  });

  const fairShare = totalSplitExpenses / 2;

  // Calculate User1's balance relative to the fair share and 100% splits
  // Positive balance means User2 owes User1
  // Negative balance means User1 owes User2
  const user1Balance = user1_paid_50_50 - fairShare + user1_paid_100_owed_by_other - user2_paid_100_owed_by_other;

  // Use user1Balance to determine settlement direction and amount
  const finalBalance = user1Balance;

  // Determine settlement amount and direction based on final balance
  let settlementAmount = 0;
  let settlementDirection: { fromUserId: string; toUserId: string } | null = null;

  // Use a small threshold to avoid floating point issues near zero
  const threshold = 0.005;
  if (finalBalance < -threshold) { // User1 owes User2
    settlementAmount = Math.abs(finalBalance);
    settlementDirection = { fromUserId: user1.id, toUserId: user2.id };
  } else if (finalBalance > threshold) { // User2 owes User1
    settlementAmount = finalBalance;
    settlementDirection = { fromUserId: user2.id, toUserId: user1.id };
  } else { // Considered settled
    settlementAmount = 0;
    settlementDirection = null;
  }

  // Create the summary object
  return {
    month: currentMonth,
    totalExpenses: totalExpenses,
    userExpenses: userExpensesPaid,
    settlementAmount,
    settlementDirection,
  };
}

/**
 * Calculate total expenses by category
 * @param expenses - List of expenses
 * @returns Record of category IDs to total amounts
 */
export function calculateCategoryTotals(expenses: Expense[]): Record<string, number> {
  const categoryTotals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const categoryId = expense.categoryId;
    const amount = Number(expense.amount) || 0;
    
    if (categoryId) {
      categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + amount;
    }
  });
  
  return categoryTotals;
}

/**
 * Calculate total expenses by location
 * @param expenses - List of expenses
 * @returns Record of location IDs to total amounts
 */
export function calculateLocationTotals(expenses: Expense[]): Record<string, number> {
  const locationTotals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const locationId = expense.locationId;
    const amount = Number(expense.amount) || 0;
    
    if (locationId) {
      locationTotals[locationId] = (locationTotals[locationId] || 0) + amount;
    }
  });
  
  return locationTotals;
}

/**
 * Calculate total expenses by user
 * @param expenses - List of expenses
 * @returns Record of user IDs to total amounts
 */
export function calculateUserTotals(expenses: Expense[]): Record<string, number> {
  const userTotals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const userId = expense.paidByUserId;
    const amount = Number(expense.amount) || 0;
    
    if (userId) {
      userTotals[userId] = (userTotals[userId] || 0) + amount;
    }
  });
  
  return userTotals;
}
