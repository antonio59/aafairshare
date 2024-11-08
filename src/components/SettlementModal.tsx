import React from 'react';
import { X } from 'lucide-react';
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

  const handleSettle = () => {
    months.forEach(month => {
      settleMonth(month, currentUser?.name || '', balance);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Confirm Settlement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to mark the following months as settled?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            {months.map(month => (
              <div key={month} className="py-1">
                {format(new Date(month + '-01'), 'MMMM yyyy')}
              </div>
            ))}
          </div>
          <p className="font-medium">
            Total Balance: £{Math.abs(balance).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            {balance > 0 ? 'Antonio owes Andres' : 'Andres owes Antonio'}
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSettle}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Confirm Settlement
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;