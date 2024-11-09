import React, { useState, useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { format } from 'date-fns';
import { Edit2, Trash2, FileSpreadsheet, FileText, Search, Filter, X } from 'lucide-react';
import ExpenseEditModal from './ExpenseEditModal';
import MonthSelector from './MonthSelector';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const ExpenseList = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaidBy, setSelectedPaidBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    expenses, 
    categories,
    tags, 
    isMonthSettled, 
    getSettlementDetails,
    deleteExpense 
  } = useExpenseStore();

  // Filter expenses based on month and search/filter criteria
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => format(new Date(expense.date), 'yyyy-MM') === selectedMonth)
      .filter(expense => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          expense.description?.toLowerCase().includes(searchLower) ||
          categories.find(c => c.id === expense.category)?.name.toLowerCase().includes(searchLower) ||
          expense.tags?.some(tagId => 
            tags.find(t => t.id === tagId)?.name.toLowerCase().includes(searchLower)
          );
        
        const matchesCategory = !selectedCategory || expense.category === selectedCategory;
        const matchesPaidBy = !selectedPaidBy || expense.paidBy === selectedPaidBy;
        
        return matchesSearch && matchesCategory && matchesPaidBy;
      });
  }, [expenses, selectedMonth, searchTerm, selectedCategory, selectedPaidBy, categories, tags]);

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const isSettled = isMonthSettled(selectedMonth);
  const settlementDetails = getSettlementDetails(selectedMonth);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
  };

  const handleExportExcel = () => {
    const monthName = format(new Date(selectedMonth + '-01'), 'MMMM yyyy');
    exportToExcel(filteredExpenses, categories, tags, {
      title: `Monthly Expenses - ${monthName}`,
      subtitle: `Total Amount: £${totalAmount.toFixed(2)}`,
      showLogo: true,
      showFooter: true,
      isSettled,
      settledBy: settlementDetails?.settledBy,
      settledDate: settlementDetails?.settledAt ? format(new Date(settlementDetails.settledAt), 'dd/MM/yyyy') : undefined,
    });
  };

  const handleExportPDF = () => {
    const monthName = format(new Date(selectedMonth + '-01'), 'MMMM yyyy');
    exportToPDF(filteredExpenses, categories, tags, {
      title: `Monthly Expenses - ${monthName}`,
      subtitle: `Total Amount: £${totalAmount.toFixed(2)}`,
      showLogo: true,
      showFooter: true,
      isSettled,
      settledBy: settlementDetails?.settledBy,
      settledDate: settlementDetails?.settledAt ? format(new Date(settlementDetails.settledAt), 'dd/MM/yyyy') : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters || selectedCategory || selectedPaidBy
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet size={18} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPaidBy}
                onChange={(e) => setSelectedPaidBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Payers</option>
                <option value="Andres">Andres</option>
                <option value="Antonio">Antonio</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Expenses</h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Total: £{totalAmount.toFixed(2)}</p>
              <p className={`text-sm ${isSettled ? 'text-green-600' : 'text-gray-600'}`}>
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
          {filteredExpenses.map((expense) => {
            const expenseTags = expense.tags
              ?.map(tagId => tags.find(t => t.id === tagId)?.name)
              .filter(Boolean)
              .join(', ');

            return (
              <div 
                key={expense.id} 
                className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{expense.description || categories.find(c => c.id === expense.category)?.name}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(expense.date), 'dd/MM/yyyy')} • {categories.find(c => c.id === expense.category)?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Paid by {expense.paidBy} • {expense.split === 'equal' ? 'Split equally' : 'No split'}
                  </p>
                  {expenseTags && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {expenseTags.split(', ').map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium whitespace-nowrap">£{expense.amount.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      title="Edit expense"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredExpenses.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchTerm || selectedCategory || selectedPaidBy ? (
                <>
                  <p className="font-medium">No matching expenses found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </>
              ) : (
                <>
                  <p className="font-medium">No expenses for this month</p>
                  <p className="text-sm mt-1">Add your first expense to get started</p>
                </>
              )}
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
