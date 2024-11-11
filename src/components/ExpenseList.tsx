import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { Plus, Edit2, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import ExpenseEditModal from './ExpenseEditModal';
import MonthSelector from './MonthSelector';
import type { Expense } from '../types';
import { format } from 'date-fns';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const ExpenseList = () => {
  const navigate = useNavigate();
  const { expenses, categories, tags, deleteExpense } = useExpenseStore();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleExportExcel = async () => {
    setIsExporting('excel');
    try {
      await exportToExcel(monthlyExpenses, categories, tags, selectedMonth);
    } catch (error) {
      console.error('Failed to export to Excel:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = () => {
    setIsExporting('pdf');
    try {
      exportToPDF(monthlyExpenses, categories, tags, selectedMonth);
    } catch (error) {
      console.error('Failed to export to PDF:', error);
    } finally {
      setIsExporting(null);
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={isExporting !== null}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isExporting === 'excel'
                ? 'bg-green-100 text-green-800 cursor-wait'
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Export to Excel"
          >
            <FileSpreadsheet size={18} />
            <span className="hidden sm:inline">
              {isExporting === 'excel' ? 'Exporting...' : 'Excel'}
            </span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting !== null}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isExporting === 'pdf'
                ? 'bg-red-100 text-red-800 cursor-wait'
                : 'bg-red-600 text-white hover:bg-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Export to PDF"
          >
            <FileText size={18} />
            <span className="hidden sm:inline">
              {isExporting === 'pdf' ? 'Exporting...' : 'PDF'}
            </span>
          </button>
          <button
            onClick={() => navigate('/add')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
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
                className="flex flex-col py-4 px-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-blue-600">{category?.name}</span>
                    {expenseTags && expenseTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {expenseTags.map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-lg text-gray-900">£{expense.amount.toFixed(2)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                  <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span>{expense.description || 'Untitled Expense'}</span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span>Paid by {expense.paidBy}</span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span>{expense.split === 'equal' ? 'Equal Split' : 'No Split'}</span>
                  <div className="flex-grow flex justify-end gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      aria-label="Edit expense"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      aria-label="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
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
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Monthly Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-900">Total Spent:</span>
              <span className="font-bold text-xl text-gray-900">£{monthlyTotals.total.toFixed(2)}</span>
            </div>
            <div className="p-4 rounded-lg bg-blue-50">
              {monthlyTotals.andresPaid > monthlyTotals.andresShare ? (
                <p className="text-blue-800 font-medium text-center text-lg">
                  Antonio owes Andres £{(monthlyTotals.andresPaid - monthlyTotals.andresShare).toFixed(2)}
                </p>
              ) : (
                <p className="text-blue-800 font-medium text-center text-lg">
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
