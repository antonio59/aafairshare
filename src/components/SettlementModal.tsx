import { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

interface SettlementModalProps {
  months: string[];
  balance: number;
  open: boolean;
  onClose: () => void;
}

const SettlementModal = ({ months, balance, open, onClose }: SettlementModalProps) => {
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Settlement</DialogTitle>
        </DialogHeader>

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

        <DialogFooter className="mt-6">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettlementModal;
