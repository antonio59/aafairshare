/**
 * Settlements types file for application-wide use
 * All settlement-related components should use these interfaces
 */

import { Expense } from "../expenses";

/**
 * Settlement status options
 */
export type SettlementStatus = 'pending' | 'partial' | 'completed';

/**
 * Core settlement interface for a single settlement record
 */
export interface Settlement {
  id: string;
  user_id: string;
  month_year: string;
  amount: number;
  status: SettlementStatus;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Frontend-specific fields for display purposes
  _currency?: string;
  _displayName?: string;
}

/**
 * Interface for settlement creation operations
 */
export interface SettlementCreate {
  user_id: string;
  month_year: string;
  amount: number;
  status: SettlementStatus;
  settled_at?: string | null;
}

/**
 * Interface for settlement update operations
 */
export interface SettlementUpdate {
  id: string;
  status?: SettlementStatus;
  amount?: number;
  settled_at?: string | null;
}

/**
 * Monthly expense summary with settlement data
 */
export interface MonthlySettlementSummary {
  month: string;
  expenses: Expense[];
  total: number;
  totalPaidByCurrentUser: number;
  totalPaidByOtherUser: number;
  netBalance: number;
  equalSplitTotal: number;
  noSplitTotal: number;
  isSettled: boolean;
  settlementAmount: number;
  settlementDate: string | null;
  settlementId: string | null;
  settledByCurrentUser: boolean;
  currentUserNoSplitOwes: number;
  otherUserNoSplitOwes: number;
}

/**
 * Balance data for settlements
 */
export interface BalanceData {
  monthlyExpenses: MonthlySettlementSummary[];
  totalUnsettledAmount: string;
}

/**
 * Settlement data structure for the UI
 */
export interface SettlementData {
  settlements: Settlement[];
  settlementsByMonth: {
    [key: string]: Settlement[];
  };
}

/**
 * API response for settlement operations
 */
export interface SettlementResponse {
  success: boolean;
  message?: string;
  data?: Settlement | Settlement[] | null;
  error?: any;
}

/**
 * Parameters for user balance calculation
 */
export interface BalanceCalculationParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Interface for partial payment functionality
 */
export interface PartialPayment {
  id: string;
  settlement_id: string;
  amount: number;
  created_at: string;
} 