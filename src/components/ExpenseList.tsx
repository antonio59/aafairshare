import React, { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { format } from 'date-fns';
import { Edit2, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import ExpenseEditModal from './ExpenseEditModal';
import MonthSelector from './MonthSelector';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const ExpenseList = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  const { 
    expenses, 
    categories,
    tags, 
    isMonthSettled, 
    getSettlementDetails,
    deleteExpense 
  } = useExpenseStore();

  const monthlyExpenses = expenses.filter(
    (expense) => format(new Date(expense.date), 'yyyy-MM') === selectedMonth
  );

  const totalAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const isSettled = isMonthSettled(selectedMonth);
  const settlementDetails = getSettlementDetails(selectedMonth);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
  };

  const handleExportExcel = () => {
    const monthName = format(new Date(selectedMonth + '-01'), 'MMMM yyyy');
    exportToExcel(monthlyExpenses, categories, tags, {
      title: `Monthly Expenses - ${monthName}`,
      subtitle: `Total Amount: £${totalAmount.toFixed(2)}`,
      showLogo: true,
      showFooter: true,
      isSettled: isSettled,
      settledBy: settlementDetails?.settledBy,
      settledDate: settlementDetails?.settledAt ? format(new Date(settlementDetails.settledAt), 'dd/MM/yyyy') : undefined,
    });
  };

  const handleExportPDF = () => {
    const monthName = format(new Date(selectedMonth + '-01'), 'MMMM yyyy');
    exportToPDF(monthlyExpenses, categories, tags, {
      title: `Monthly Expenses - ${monthName}`,
      subtitle: `Total Amount: £${totalAmount.toFixed(2)}`,
      showLogo: true,
      showFooter: true,
      isSettled: isSettled,
      settledBy: settlementDetails?.settledBy,
      settledDate: settlementDetails?.settledAt ? format(new Date(settlementDetails.settledAt), 'dd/MM/yyyy') : undefined,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileSpreadsheet size={18} />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FileText size={18} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Expenses</h2>
            <div className="text-right">
              <p className="text-lg font-semibold">Total: £{totalAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">
                {isSettled ? (
                  <>
                    Settled by {settlementDetails?.settledBy} on{' '}
                    {settlementDetails?.settledAt && format(new Date(settlementDetails.settledAt), 'dd/MM/yyyy')}
                  </>
                ) : (
                  'Unsettled'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {monthlyExpenses.map((expense) => {
            const expenseTags = expense.tags
              ?.map(tagId => tags.find(t => t.id === tagId)?.name)
              .filter(Boolean)
              .join(', ');

            return (
              <div key={expense.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(expense.date), 'dd/MM/yyyy')} • {categories.find(c => c.id === expense.category)?.name || 'Uncategorized'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Paid by {expense.paidBy} • {expense.split === 'equal' ? 'Split equally' : 'No split'}
                  </p>
                  {expenseTags && (
                    <p className="text-sm text-blue-600 mt-1">
                      {expenseTags}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">£{expense.amount.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {monthlyExpenses.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No expenses found for this month
            </div>
          )}
        </div>
      </div>

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