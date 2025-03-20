/**
 * Settlement Calculator
 * 
 * This utility provides functions to calculate financial settlements between users
 * based on their expenses with different split types.
 */

/**
 * User interface representing a user in the settlement calculation
 */
export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Expense interface representing an expense in the settlement calculation
 * Supports multiple split type formats
 */
export interface Expense {
  id: string;
  amount: number;
  date: string;
  paid_by: string;
  split_type: string; // Accepts 'Equal', 'NoSplit', 'No Split', etc.
  paid_by_user?: User;
}

/**
 * Basic Settlement interface representing just the calculation result
 */
export interface BasicSettlement {
  from: string;
  to: string;
  amount: number;
}

/**
 * Complete Settlement interface compatible with the application's type
 */
export interface Settlement extends BasicSettlement {
  month?: string;
  status?: 'pending' | 'completed';
  created_at?: string;
  updated_at?: string;
}

/**
 * UserTotal interface representing totals for a single user
 */
export interface UserTotal {
  paid: {
    equalSplit: number;
    noSplit: number;
  };
  owed: number;
  email: string;
  name: string;
}

/**
 * UserTotals interface mapping user IDs to their totals
 */
export interface UserTotals {
  [key: string]: UserTotal;
}

/**
 * Calculates settlement between two users based on their expenses
 * 
 * This function handles both equal split and no-split expenses:
 * - For equal split expenses: Both users should pay half of the total amount
 * - For no-split expenses: The user who didn't pay owes the full amount to the user who paid
 * 
 * The final settlement combines both types to determine the net amount owed between users.
 * 
 * @param expenses - Array of expenses containing amount, split type, and paid by information
 * @param users - Array of users participating in the expense settlement
 * @returns BasicSettlement object indicating who pays whom and how much
 */
export function calculateSettlement(expenses: Expense[], users: User[]): BasicSettlement {
  // Short-circuit for empty expenses array to improve performance
  if (!expenses.length) {
    return {
      from: users[1]?.name || 'User2',
      to: users[0]?.name || 'User1',
      amount: 0
    };
  }
  
  // Initialize totals for all users
  // Use a more performant approach to initialize userTotals
  const userTotals: UserTotals = {};
  for (const user of users) {
    userTotals[user.id] = {
      paid: { equalSplit: 0, noSplit: 0 },
      owed: 0,
      email: user.email,
      name: user.name
    };
  }

  // Pre-calculate split types and totals in a single pass for better performance
  let totalEqualSplitAmount = 0;
  
  // Calculate what each user paid for different expense types
  for (const expense of expenses) {
    const paidByUserId = expense.paid_by;
    const userTotal = userTotals[paidByUserId];
    
    if (!userTotal) continue; // Skip if user not found
    
    // Normalize split types to handle different formats
    const normalizedSplitType = expense.split_type.toLowerCase();
    
    if (normalizedSplitType === 'equal') {
      // For equal splits - track separately
      userTotal.paid.equalSplit += expense.amount;
      totalEqualSplitAmount += expense.amount;
    } else {
      // For no-split expenses - track separately 
      // (handles both 'NoSplit' and 'No Split' formats)
      userTotal.paid.noSplit += expense.amount;
    }
  }

  // Optimization: direct access instead of Object.entries for better performance
  // Handle edge case with less than 2 users
  if (users.length < 2) {
    return {
      from: users[0]?.name || 'User2',
      to: users[0]?.name || 'User1',
      amount: 0
    };
  }
  
  const user1Id = users[0].id;
  const user2Id = users[1].id;
  const user1Data = userTotals[user1Id];
  const user2Data = userTotals[user2Id];
  
  // Calculate equal split obligations (we already have the total)
  const equalSplitPerUser = totalEqualSplitAmount / 2;
  
  // User1's balance for equal split expenses (positive means User1 is owed money)
  const user1EqualSplitBalance = user1Data.paid.equalSplit - equalSplitPerUser;
  
  // User1's balance for no-split expenses (positive means User1 is owed money)
  const user1NoSplitBalance = user1Data.paid.noSplit - user2Data.paid.noSplit;
  
  // Combined balance (positive means User1 is owed money by User2)
  const finalBalance = user1EqualSplitBalance + user1NoSplitBalance;
  
  // Round to 2 decimal places to avoid floating-point precision issues
  const roundedBalance = Number(finalBalance.toFixed(2));
  
  if (roundedBalance > 0) {
    // User1 is owed money by User2
    return {
      from: user2Data.name,
      to: user1Data.name,
      amount: roundedBalance
    };
  } else if (roundedBalance < 0) {
    // User2 is owed money by User1
    return {
      from: user1Data.name,
      to: user2Data.name,
      amount: Number(Math.abs(roundedBalance).toFixed(2))
    };
  } else {
    // No one owes anything
    return {
      from: user2Data.name,
      to: user1Data.name,
      amount: 0
    };
  }
}

/**
 * Create a full settlement record from a basic settlement
 * 
 * This helper function transforms a basic settlement calculation result into a
 * complete settlement record with status and timestamps.
 * 
 * @param basicSettlement - The basic settlement with from, to, and amount
 * @param month - The month this settlement applies to (YYYY-MM format)
 * @param status - The settlement status
 * @returns A complete settlement record
 */
export function createSettlementRecord(
  basicSettlement: BasicSettlement,
  month: string,
  status: 'pending' | 'completed' = 'pending'
): Settlement {
  return {
    ...basicSettlement,
    month,
    status,
    created_at: new Date().toISOString()
  };
}

/**
 * Calculates settlements for monthly expense groups
 * 
 * This is a convenience function for calculating settlements for expenses
 * grouped by month. It enriches the basic settlement with additional metadata
 * like month, status, and timestamps.
 * 
 * @param groupedExpenses - Object mapping month/year to array of expenses
 * @param users - Array of users participating in the settlements
 * @returns Object mapping month/year to complete settlement with metadata
 */
export function calculateMonthlySettlements(
  groupedExpenses: Record<string, Expense[]>, 
  users: User[]
): Record<string, Settlement> {
  const settlements: Record<string, Settlement> = {};
  for (const [monthYear, expenses] of Object.entries(groupedExpenses)) {
    // Calculate the basic settlement first
    const basicSettlement = calculateSettlement(expenses, users);
    
    // Use our helper to create a complete settlement record
    settlements[monthYear] = createSettlementRecord(basicSettlement, monthYear);
  }
  
  return settlements;
}
