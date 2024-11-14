import { useState, useMemo } from 'react';
import { Edit2, Trash2, Calendar, User, Split } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import ExpenseEditModal from './ExpenseEditModal';
import MonthSelector from './MonthSelector';
import type { Expense } from '../types';
import { format } from 'date-fns';

const ExpenseList = () => {
  const { expenses, categories, tags, deleteExpense } = useExpenseStore();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  // Filter expenses by selected month
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(expense => 
      format(new Date(expense.date), 'yyyy-MM') === selectedMonth
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedMonth]);

  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    return monthlyExpenses.reduce((acc, expense) => {
      const amount = expense.amount;
      if (expense.paidBy === 'Andres') {
        acc.andresPaid += amount;
        if (expense.split === 'equal') {
          acc.andresShare += amount / 2;
          acc.antonioShare += amount / 2;
        } else {
          acc.andresShare += amount;
        }
      } else {
        acc.antonioPaid += amount;
        if (expense.split === 'equal') {
          acc.andresShare += amount / 2;
          acc.antonioShare += amount / 2;
        } else {
          acc.antonioShare += amount;
        }
      }
      acc.total += amount;
      return acc;
    }, {
      andresPaid: 0,
      antonioPaid: 0,
      andresShare: 0,
      antonioShare: 0,
      total: 0
    });
  }, [monthlyExpenses]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Expenses</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y">
          {monthlyExpenses.map((expense) => {
            const category = categories.find(c => c?.id === expense.category);
            const expenseTags = expense.tags?.map(tagId => 
              tags.find(t => t.id === tagId)?.name
            ).filter(Boolean);

            return (
              <div
                key={expense.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-blue-600 truncate">
                        {category?.name}
                      </span>
                      <span className="font-semibold text-lg text-gray-900">
                        £{expense.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-base text-gray-900 mb-2 break-words">
                      {expense.description || 'Untitled Expense'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="w-10 h-10 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Edit expense"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="w-10 h-10 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {expenseTags && expenseTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {expenseTags.map((tag, index) => (
                      <span key={index} className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Paid by {expense.paidBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Split className="w-4 h-4" />
                    <span>{expense.split === 'equal' ? 'Equal Split' : 'No Split'}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {monthlyExpenses.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No expenses for this month. Add your first expense to get started!
            </div>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      {monthlyExpenses.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Monthly Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Andres</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount paid:</span>
                <span className="font-medium">£{monthlyTotals.andresPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Share amount:</span>
                <span className="font-medium">£{monthlyTotals.andresShare.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Antonio</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount paid:</span>
                <span className="font-medium">£{monthlyTotals.antonioPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Share amount:</span>
                <span className="font-medium">£{monthlyTotals.antonioShare.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
              <span className="font-medium text-gray-900">Total Spent:</span>
              <span className="font-bold text-xl text-gray-900">£{monthlyTotals.total.toFixed(2)}</span>
            </div>
            <div className="p-4 rounded-lg bg-blue-50">
              {monthlyTotals.andresPaid > monthlyTotals.andresShare ? (
                <p className="text-blue-800 font-medium text-center text-lg break-words">
                  Antonio owes Andres £{(monthlyTotals.andresPaid - monthlyTotals.andresShare).toFixed(2)}
                </p>
              ) : (
                <p className="text-blue-800 font-medium text-center text-lg break-words">
                  Andres owes Antonio £{(monthlyTotals.antonioShare - monthlyTotals.antonioPaid).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
};

export default ExpenseList;
