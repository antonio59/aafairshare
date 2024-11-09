import React, { useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import { format } from 'date-fns';

interface SettlementModalProps {
  months: string[];
  balance: number;
  onClose: () => void;
}

const SettlementModal = ({ months, balance, onClose }: SettlementModalProps) => {
  const { settleMonth } = useExpenseStore();
  const { currentUser } = useUserStore();
  const [isSettling, setIsSettling] = useState(false);

  const handleSettle = async () => {
    setIsSettling(true);
    try {
      for (const month of months) {
        await settleMonth(month, currentUser?.name || '', balance);
      }
      onClose();
    } catch (error) {
      console.error('Failed to settle months:', error);
    } finally {
      setIsSettling(false);
    }
  };

  const getBalanceColor = (amount: number) => {
    if (amount === 0) return 'text-gray-600';
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Settlement</h2>
          <button 
            onClick={onClose}
            disabled={isSettling}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="flex items-start gap-3 bg-yellow-50 text-yellow-800 p-4 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Important Note</p>
              <p className="text-sm mt-1">
                This action cannot be undone. Make sure all parties have agreed to the settlement before proceeding.
              </p>
            </div>
          </div>

          {/* Months List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Months</h3>
            <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
              {months.map(month => (
                <div key={month} className="p-3 flex justify-between items-center">
                  <span className="text-gray-900">
                    {format(new Date(month + '-01'), 'MMMM yyyy')}
                  </span>
                  <span className={getBalanceColor(balance)}>
                    £{Math.abs(balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Balance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-900">Total Balance</span>
              <span className={`font-bold ${getBalanceColor(balance)}`}>
                £{Math.abs(balance).toFixed(2)}
              </span>
            </div>
            <p className={`text-sm ${getBalanceColor(balance)}`}>
              {balance > 0 
                ? 'Antonio will pay Andres'
                : balance < 0
                  ? 'Andres will pay Antonio'
                  : 'No payment needed'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSettling}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSettle}
            disabled={isSettling}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSettling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Settling...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm Settlement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
