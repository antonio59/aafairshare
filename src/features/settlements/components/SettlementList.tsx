import React, { useState } from 'react';
import { _Check, _AlertTriangle } from 'lucide-react';
import { LoadingSpinner, StatusMessage } from '../../shared/components';
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';

interface MonthData {
  month: string;
  total: number;
  totalPaidByCurrentUser: number;
  totalPaidByOtherUser: number;
  netBalance: number;
  expenses: any[];
  equalSplitTotal?: number;
  noSplitTotal?: number;
  currentUserNoSplitOwes?: number;
  otherUserNoSplitOwes?: number;
  [key: string]: any;
}

interface PartialPaymentFormProps {
  monthYear: string;
  handlePartialPaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  partialAmount: string;
  handleSubmit: (amount: number) => void;
  remainingAmount: number;
  formatAmount: (amount: number) => string;
  isDisabled: boolean;
  onCancel: () => void;
}

interface MonthlyDetailProps {
  monthData: MonthData;
  formatAmount: (amount: number) => string;
  hasPartialPayments: (monthYear: string) => boolean;
  _getTotalPartialPayments: (monthYear: string) => number;
  getRemainingAmount: (monthData: MonthData) => number;
  isSettled?: boolean;
}

interface SettlementListProps {
  months: MonthData[];
  activeTab: string;
  loading: boolean;
  formatAmount: (amount: number) => string;
  partialPaymentMode: boolean;
  selectedMonth: string | null;
  partialAmount: string;
  handlePartialPaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  togglePartialPayment: (monthYear: string) => void;
  handleSettleMonth: (monthYear: string, amount: number, isPartial?: boolean) => void;
  handleUnsettleMonth: (monthYear: string) => void;
  hasPartialPayments: (monthYear: string) => boolean;
  getRemainingAmount: (monthData: MonthData) => number;
  isCurrentMonth: (monthYear: string) => boolean;
  canSettleMonth: (monthYear: string) => boolean;
  currentUserOwesForMonth: (monthData: MonthData) => boolean;
  getSettlementDetails: (monthYear: string) => any;
  _getTotalPartialPayments: (monthYear: string) => number;
}

/**
 * Partial Payment Form component
 * @param {Object} props - Component props
 * @param {string} props.monthYear - The month/year
 * @param {function} props.handlePartialPaymentChange - Handler for payment changes
 * @param {string} props.partialAmount - Current partial amount value
 * @param {function} props.handleSubmit - Handler for payment submission
 * @param {number} props.remainingAmount - Remaining amount to be paid
 * @param {function} props.formatAmount - Amount formatter function
 * @param {boolean} props.loading - Loading state
 * @param {function} props.onCancel - Handler to cancel the payment
 */
const PartialPaymentForm: React.FC<PartialPaymentFormProps> = ({
  monthYear,
  handlePartialPaymentChange,
  partialAmount,
  handleSubmit,
  remainingAmount,
  formatAmount,
  isDisabled,
  onCancel
}) => {
  const [error, setError] = useState('');

  const validateAndSubmit = () => {
    if (!partialAmount) {
      setError('Please enter an amount');
      return;
    }
    
    const amount = parseFloat(partialAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setError('');
    handleSubmit(amount);
  };

  // Helper to prefill the full amount
  const fillFullAmount = () => {
    // Create a synthetic event to update the amount
    const event = {
      target: { value: remainingAmount.toString() }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handlePartialPaymentChange(event);
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-blue-800">Payment Amount</h4>
        <button
          onClick={onCancel}
          className="text-xs text-blue-600 hover:text-blue-800"
          aria-label="Cancel partial payment"
        >
          Cancel
        </button>
      </div>
      
      {error && (
        <StatusMessage 
          type="error" 
          message={error} 
          onDismiss={() => setError('')} 
        />
      )}
      
      <div className="flex items-center mb-2 mt-2">
        <span className="text-sm text-blue-700 mr-2">Amount:</span>
        <input
          type="text"
          className="border border-blue-300 rounded px-3 py-1 text-sm w-24"
          placeholder="0.00"
          value={partialAmount}
          onChange={handlePartialPaymentChange}
          aria-label={`Partial payment amount for ${monthYear}`}
        />
        <button
          onClick={fillFullAmount}
          className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          title="Fill full amount"
        >
          Full
        </button>
        <button
          onClick={validateAndSubmit}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDisabled}
          aria-label="Make payment"
        >
          Pay
        </button>
      </div>
      <p className="text-xs text-blue-600">
        Amount to settle: {formatAmount(remainingAmount)}
      </p>
    </div>
  );
};

/**
 * Monthly Detail component for settlement list
 * @param {Object} props - Component props
 * @param {Object} props.monthData - Month data
 * @param {function} props.formatAmount - Amount formatter function
 */
const MonthlyDetail: React.FC<MonthlyDetailProps> = ({ 
  monthData, 
  formatAmount, 
  hasPartialPayments, _getTotalPartialPayments, 
  getRemainingAmount, 
  isSettled = false 
}) => {
  // Ensure all numeric values are properly handled
  const ensureNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };
  
  const _total = ensureNumber(monthData._total);
  const totalPaidByCurrentUser = ensureNumber(monthData.totalPaidByCurrentUser);
  const totalPaidByOtherUser = ensureNumber(monthData.totalPaidByOtherUser);
  const netBalance = ensureNumber(monthData.netBalance);
  const equalSplitTotal = ensureNumber(monthData.equalSplitTotal || 0);
  const noSplitTotal = ensureNumber(monthData.noSplitTotal || 0);
  const currentUserNoSplitOwes = ensureNumber(monthData.currentUserNoSplitOwes || 0);
  const otherUserNoSplitOwes = ensureNumber(monthData.otherUserNoSplitOwes || 0);
  
  // Each should pay 50% of the equal split expenses
  const eachShouldPayEqual = equalSplitTotal / 2;
  
  // Check if balance is essentially zero (allowing for tiny rounding errors)
  const hasZeroBalance = Math.abs(netBalance) < 0.01;
  
  // If not zero, determine if the user is owed money or owes money
  const isOwed = netBalance > 0;
  const settlementAmount = Math.abs(netBalance);
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Antonio Paid</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatAmount(totalPaidByCurrentUser)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Andres Paid</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatAmount(totalPaidByOtherUser)}
          </p>
        </div>
      </div>

      {equalSplitTotal > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-sm font-medium text-gray-700">Equal Split Expenses (50/50)</p>
          <div className="flex justify-between items-center">
            <p className="text-base font-semibold text-gray-900">
              {formatAmount(equalSplitTotal)} total
            </p>
            <p className="text-sm text-gray-600">
              Each pays: {formatAmount(eachShouldPayEqual)}
            </p>
          </div>
        </div>
      )}

      {noSplitTotal > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-sm font-medium text-gray-700">Full Payment Expenses (100%)</p>
          {currentUserNoSplitOwes > 0 && (
            <p className="text-sm text-gray-900">You owe: {formatAmount(currentUserNoSplitOwes)}</p>
          )}
          {otherUserNoSplitOwes > 0 && (
            <p className="text-sm text-gray-900">You're owed: {formatAmount(otherUserNoSplitOwes)}</p>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">Final Settlement</p>
            {isSettled ? (
              <p className="text-lg font-semibold text-gray-500">
                <span className="line-through">
                  {hasZeroBalance 
                    ? `Balanced - No payment needed`
                    : isOwed
                      ? `You were owed ${formatAmount(settlementAmount)}` 
                      : `You owed ${formatAmount(settlementAmount)}`}
                </span>
                <span className="ml-2 text-green-600">Settled</span>
              </p>
            ) : (
              hasZeroBalance ? (
                <p className="text-lg font-semibold text-gray-600">
                  Balanced - No payment needed
                </p>
              ) : isOwed ? (
                <p className="text-lg font-semibold text-green-600">
                  You are owed {formatAmount(settlementAmount)}
                </p>
              ) : (
                <p className="text-lg font-semibold text-red-600">
                  You owe {formatAmount(settlementAmount)}
                </p>
              )
            )}
          </div>
          {hasPartialPayments(monthData.month) && !isSettled && (
            <div className="text-right">
              <p className="text-xs text-gray-500">After partial payments:</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatAmount(getRemainingAmount(monthData))}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Settlement List component
 * @param {Object} props - Component props
 * @param {Array} props.months - List of months
 * @param {string} props.activeTab - Current active tab
 * @param {boolean} props.loading - Loading state
 * @param {function} props.formatAmount - Amount formatter function
 * @param {boolean} props.partialPaymentMode - Whether partial payment mode is active
 * @param {string} props.selectedMonth - Currently selected month
 * @param {string} props.partialAmount - Current partial amount value
 * @param {function} props.handlePartialPaymentChange - Handler for payment changes
 * @param {function} props.togglePartialPayment - Handler to toggle partial payment mode
 * @param {function} props.handleSettleMonth - Handler for settling a month
 * @param {function} props.handleUnsettleMonth - Handler for unsettling a month
 * @param {function} props.hasPartialPayments - Function to check if a month has partial payments
 * @param {function} props.getRemainingAmount - Function to get remaining amount for a month
 * @param {function} props.isCurrentMonth - Function to check if a month is the current month
 * @param {function} props.canSettleMonth - Function to check if a month can be settled
 * @param {function} props.currentUserOwesForMonth - Function to check if current user owes for a month
 * @param {function} props.getSettlementDetails - Function to get settlement details for a month
 */
const SettlementList: React.FC<SettlementListProps> = ({
  months,
  activeTab,
  loading,
  formatAmount,
  partialPaymentMode,
  selectedMonth,
  partialAmount,
  handlePartialPaymentChange,
  togglePartialPayment,
  handleSettleMonth,
  handleUnsettleMonth,
  hasPartialPayments,
  getRemainingAmount,
  isCurrentMonth,
  canSettleMonth,
  currentUserOwesForMonth,
  getSettlementDetails, _getTotalPartialPayments
}) => {
  const { _handleError } = useErrorHandler({ context: 'SettlementList' });

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Loading settlement data..." />
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {activeTab === 'active' ? 'No active months to settle' : 'No settled months yet'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {months.map((monthData: MonthData) => {
        const settlementDetails = getSettlementDetails(monthData.month);
        const isSettled = activeTab === 'settled';
        const canSettle = canSettleMonth(monthData.month);
        const isOwing = currentUserOwesForMonth(monthData);
        const hasZeroBalance = Math.abs(monthData.netBalance) < 0.01; // Consider values very close to 0 as zero
        
        return (
          <div key={monthData.month} className="hover:bg-gray-50 transition-colors">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{monthData.month}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Expenses: {formatAmount(monthData._total)}
                    </p>
                    
                    {/* Show partial payments if any */}
                    {hasPartialPayments(monthData.month) && (
                      <div className="mt-2 text-xs text-emerald-600">
                        <span className="font-medium">
                          Partial payments: {formatAmount(_getTotalPartialPayments(monthData.month))}
                        </span>
                      </div>
                    )}
                    
                    {/* Show settlement date for settled months */}
                    {settlementDetails?.settled_at && isSettled && (
                      <p className="text-xs text-gray-500 mt-1">
                        Settled on: {new Date(settlementDetails.settled_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {isSettled ? (
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Settled
                      </span>
                      <button
                        onClick={() => handleUnsettleMonth(monthData.month)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                        aria-label={`Unsettle ${monthData.month}`}
                      >
                        Unsettle
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      {isCurrentMonth(monthData.month) ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Current Month
                        </span>
                      ) : !canSettle ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          Wait until next month
                        </span>
                      ) : hasZeroBalance ? (
                        // Show a "Mark as Settled" button for zero balance months
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSettleMonth(monthData.month, 0, false)}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full hover:bg-green-700"
                            aria-label={`Mark ${monthData.month} as settled`}
                          >
                            Mark as Settled
                          </button>
                        </div>
                      ) : isOwing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSettleMonth(monthData.month, Math.abs(monthData.netBalance))}
                            className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full hover:bg-emerald-700"
                            aria-label={`Settle ${monthData.month}`}
                          >
                            Settle
                          </button>
                          <button
                            onClick={() => togglePartialPayment(monthData.month)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700"
                            aria-label={`Make partial payment for ${monthData.month}`}
                          >
                            Partial
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          Waiting for Payment
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {partialPaymentMode && selectedMonth === monthData.month && (
                  <PartialPaymentForm
                    monthYear={monthData.month}
                    handlePartialPaymentChange={handlePartialPaymentChange}
                    partialAmount={partialAmount}
                    handleSubmit={(amount) => handleSettleMonth(monthData.month, amount, true)}
                    remainingAmount={getRemainingAmount(monthData)}
                    formatAmount={formatAmount}
                    isDisabled={!canSettle || !isOwing}
                    onCancel={() => togglePartialPayment(monthData.month)}
                  />
                )}
                
                <MonthlyDetail 
                  monthData={monthData}
                  formatAmount={formatAmount}
                  hasPartialPayments={hasPartialPayments}
                  _getTotalPartialPayments={ _getTotalPartialPayments}
                  getRemainingAmount={getRemainingAmount}
                  isSettled={isSettled}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SettlementList; 