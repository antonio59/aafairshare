import React, { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import type { RecurringExpense } from '../../types';

interface RecurringExpensesProps {
  onClose?: () => void;
}

const RecurringExpenses: React.FC<RecurringExpensesProps> = ({ onClose }) => {
  const { recurringExpenses, deleteRecurringExpense } = useExpenseStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recurring expense?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRecurringExpense(id);
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recurring Expenses</h3>
      
      {recurringExpenses.length === 0 ? (
        <p className="text-gray-500">No recurring expenses set up yet.</p>
      ) : (
        <div className="space-y-4">
          {recurringExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{expense.description}</h4>
                  <p className="text-sm text-gray-600">
                    Amount: £{expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Frequency: {expense.frequency}
                  </p>
                  <p className="text-sm text-gray-600">
                    Day of Month: {expense.dayOfMonth}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {onClose && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default RecurringExpenses;
