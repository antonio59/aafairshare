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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">Confirm Settlement</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-medium mb-2">Settlement Details</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount</span>
                <span className={`font-medium ${getBalanceColor(balance)}`}>
                  £{Math.abs(balance).toFixed(2)}
                </span>
              </div>
              <p className={`text-sm ${getBalanceColor(balance)}`}>
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              This action cannot be undone. Once settled, these months will be marked as completed
              and moved to the settlement history.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSettle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm Settlement
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
