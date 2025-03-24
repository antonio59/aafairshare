/**
 * Settlement Calculator
 * 
 * This utility provides functions to calculate financial settlements between users
 * based on their expenses with different split types.
 */

import type { Settlement as SettlementType , SplitType } from '@/types/expenses';
// We're importing Expense type but not using it directly in this file

/**
 * Simplified Expense type for settlement calculations 
 * Only includes the fields needed for the calculator
 */
export interface CalculatorExpense {
  id: string;
  amount: number;
  date: string;
  paid_by: string;
  split_type: SplitType | string;
}

/**
 * User interface representing a user in the settlement calculation
 */
export interface User {
  id: string;
  email: string;
  name: string;
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
  [userId: string]: UserTotal;
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
export type Settlement = SettlementType;

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
export function calculateSettlement(expenses: CalculatorExpense[], users: User[]): BasicSettlement[] {
  if (!users || users.length < 2) {
    throw new Error('At least two users are required for settlement calculation');
  }

  const user1 = users[0];
  const user2 = users[1];

  if (!user1?.id || !user2?.id || !user1?.email || !user2?.email || !user1?.name || !user2?.name) {
    throw new Error('Invalid user data');
  }

  const userTotals: UserTotals = {
    [user1.id]: {
      paid: { equalSplit: 0, noSplit: 0 },
      owed: 0,
      email: user1.email,
      name: user1.name,
    },
    [user2.id]: {
      paid: { equalSplit: 0, noSplit: 0 },
      owed: 0,
      email: user2.email,
      name: user2.name,
    },
  };

  let totalEqualSplit = 0;

  expenses.forEach((expense) => {
    if (!expense.paid_by || !expense.amount || !expense.split_type) return;
    
    const paidByUserId = expense.paid_by;
    const amount = expense.amount;
    const splitType = expense.split_type;

    const userTotal = userTotals[paidByUserId];
    if (userTotal && userTotal.paid) {
      if (splitType === 'Equal') {
        userTotal.paid.equalSplit += amount;
        totalEqualSplit += amount;
      } else {
        userTotal.paid.noSplit += amount;
      }
    }
  });

  const equalSplitPerUser = totalEqualSplit / 2;
  const user1Data = userTotals[user1.id];
  const user2Data = userTotals[user2.id];

  if (!user1Data || !user2Data) {
    throw new Error('Failed to calculate user data');
  }

  const user1EqualSplitBalance = user1Data.paid.equalSplit - equalSplitPerUser;
  const user1NoSplitBalance = user1Data.paid.noSplit - user2Data.paid.noSplit;
  const user1TotalBalance = user1EqualSplitBalance + user1NoSplitBalance;

  const settlements: BasicSettlement[] = [];

  if (user1TotalBalance > 0) {
    settlements.push({
      from: user2Data.name,
      to: user1Data.name,
      amount: user1TotalBalance,
    });
  } else if (user1TotalBalance < 0) {
    settlements.push({
      from: user1Data.name,
      to: user2Data.name,
      amount: Math.abs(user1TotalBalance),
    });
  }

  return settlements;
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
  const now = new Date().toISOString();
  const id = `${month}-${basicSettlement.from}-${basicSettlement.to}`;
  
  return {
    id,
    ...basicSettlement,
    month,
    month_year: month,
    status,
    created_at: now,
    updated_at: null,
    user_id: null
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
export function calculateMonthlySettlements(expenses: CalculatorExpense[], users: User[]): Record<string, SettlementType> {
  const settlements: Record<string, SettlementType> = {};
  
  // Group expenses by month
  const groupedExpenses: Record<string, CalculatorExpense[]> = {};
  
  for (const expense of expenses) {
    if (!expense.date) continue;
    const monthYear = expense.date.slice(0, 7); // Get YYYY-MM from date
    
    // Initialize if needed and use non-null assertion since we know it exists after initialization
    if (!groupedExpenses[monthYear]) {
      groupedExpenses[monthYear] = [];
    }
    
    // TypeScript doesn't recognize that we've initialized it above, so use a temp variable
    const expensesForMonth = groupedExpenses[monthYear];
    if (expensesForMonth) {
      expensesForMonth.push(expense);
    }
  }
  
  // Calculate settlements for each month
  for (const [monthYear, monthExpenses] of Object.entries(groupedExpenses)) {
    if (!monthExpenses || monthExpenses.length === 0) continue;
    
    const monthSettlements = calculateSettlement(monthExpenses, users);
    
    if (monthSettlements && monthSettlements.length > 0) {
      const basicSettlement = monthSettlements[0];
      
      if (basicSettlement) {
        settlements[monthYear] = createSettlementRecord(basicSettlement, monthYear);
      }
    }
  }
  
  return settlements;
}
