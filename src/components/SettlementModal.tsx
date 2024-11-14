import { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import { X } from 'lucide-react';

interface SettlementModalProps {
  months: string[];
  balance: number;
  onClose: () => void;
}

const SettlementModal = ({ months, balance, onClose }: SettlementModalProps) => {
  const [notes, setNotes] = useState('');
  const { currentUser } = useUserStore();
  const { settleMonth } = useExpenseStore();

  const handleSettle = async () => {
    if (!currentUser) return;

    try {
      for (const month of months) {
        await settleMonth(month, currentUser.name, balance);
      }
      onClose();
    } catch (error) {
      console.error('Failed to settle:', error);
    }
  };

  const formatBalance = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (amount > 0) {
      return `Antonio owes Andres £${absAmount.toFixed(2)}`;
    } else if (amount < 0) {
      return `Andres owes Antonio £${absAmount.toFixed(2)}`;
    }
    return 'No balance to settle';
  };

  const getBalanceColor = (amount: number) => {
    if (amount === 0) return 'text-gray-600';
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg sm:text-xl font-semibold">Confirm Settlement</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <h4 className="font-medium mb-3">Settlement Details</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between mb-2">
                <span className="text-gray-600">Amount</span>
                <span className={`font-medium ${getBalanceColor(balance)} text-lg`}>
                  £{Math.abs(balance).toFixed(2)}
                </span>
              </div>
              <p className={`text-base ${getBalanceColor(balance)}`}>
                {formatBalance(balance)}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this settlement..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-base">
              This action cannot be undone. Once settled, these months will be marked as completed
              and moved to the settlement history.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 rounded-b-lg sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSettle}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[48px]"
          >
            Confirm Settlement
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
