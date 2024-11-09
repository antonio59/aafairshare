import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import ExpenseEditModal from './ExpenseEditModal';
import type { Expense } from '../types';

const ExpenseList = () => {
  const navigate = useNavigate();
  const { expenses, categories, tags, deleteExpense } = useExpenseStore();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  // Calculate totals by split
  const totals = expenses.reduce((acc, expense) => {
    const amount = expense.amount;
    if (expense.split === 'equal') {
      acc.equalSplit += amount;
    } else {
      acc.noSplit += amount;
    }
    acc.total += amount;
    return acc;
  }, { equalSplit: 0, noSplit: 0, total: 0 });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={() => navigate('/add')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y">
          {expenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => {
              const category = categories.find(c => c?.id === expense.category);
              const expenseTags = expense.tags?.map(tagId => 
                tags.find(t => t.id === tagId)?.name
              ).filter(Boolean);

              return (
                <div
                  key={expense.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{expense.description || 'Untitled Expense'}</span>
                      <span className="text-sm text-blue-600">
                        {category?.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                      <span>£{expense.amount.toFixed(2)}</span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Paid by {expense.paidBy}</span>
                      <span>•</span>
                      <span>{expense.split === 'equal' ? 'Equal Split' : 'No Split'}</span>
                    </div>
                    {expenseTags && expenseTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {expenseTags.map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                      aria-label="Edit expense"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Delete expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          {expenses.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No expenses yet. Add your first expense to get started!
            </div>
          )}
        </div>
      </div>

      {/* Totals Summary */}
      {expenses.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Equal Split Total:</span>
              <span className="font-medium">£{totals.equalSplit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">No Split Total:</span>
              <span className="font-medium">£{totals.noSplit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">£{totals.total.toFixed(2)}</span>
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
