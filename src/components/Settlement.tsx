import { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import SettlementModal from './SettlementModal';
import SettlementHistory from './SettlementHistory';
import { Check, AlertCircle, History, PlusCircle } from 'lucide-react';

type TabType = 'create' | 'history';

const Settlement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const { currentUser } = useUserStore();
  const {
    getMonthlyBalance,
    isMonthSettled,
    expenses
  } = useExpenseStore();

  // Generate past 12 months
  const pastMonths = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), i);
    return format(date, 'yyyy-MM');
  });

  const handleMonthSelect = (month: string) => {
    setSelectedMonths(prev => {
      if (prev.includes(month)) {
        return prev.filter(m => m !== month);
      } else {
        return [...prev, month].sort();
      }
    });
  };

  const getTotalBalance = () => {
    return selectedMonths.reduce((total, month) => {
      return total + getMonthlyBalance(month);
    }, 0);
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

  // Check if a month has any expenses
  const hasExpensesInMonth = (month: string) => {
    return expenses.some(expense => format(new Date(expense.date), 'yyyy-MM') === month);
  };

  // Check if a month has a non-zero balance
  const hasNonZeroBalance = (month: string) => {
    const balance = getMonthlyBalance(month);
    return Math.abs(balance) > 0;
  };

  // A month needs settlement if it has expenses with a non-zero balance and hasn't been settled yet
  const unsettledMonths = pastMonths.filter(month => {
    const hasExpenses = hasExpensesInMonth(month);
    const nonZeroBalance = hasNonZeroBalance(month);
    const settled = isMonthSettled(month);
    return hasExpenses && nonZeroBalance && !settled;
  });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 mb-20 max-w-2xl">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex w-full sm:w-auto bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-3 rounded-md transition-colors min-h-[48px] ${
              activeTab === 'create'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="whitespace-nowrap">Create Settlement</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-3 rounded-md transition-colors min-h-[48px] ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="whitespace-nowrap">History</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Create Settlement</h2>
            {selectedMonths.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto"
              >
                <Check className="w-5 h-5" />
                <span>Settle ({selectedMonths.length})</span>
              </button>
            )}
          </div>

          {unsettledMonths.length > 0 ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">Unsettled Months</p>
                    <p className="text-blue-600 text-sm mt-1">
                      You have {unsettledMonths.length} month{unsettledMonths.length !== 1 ? 's' : ''} that need{unsettledMonths.length === 1 ? 's' : ''} to be settled.
                      Select the months you want to settle and click the "Settle" button.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {unsettledMonths.map(month => {
                  const balance = getMonthlyBalance(month);
                  const balanceColor = getBalanceColor(balance);

                  return (
                    <div
                      key={month}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleMonthSelect(month)}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedMonths.includes(month)}
                          onChange={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMonthSelect(month);
                          }}
                          className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-base">
                            {format(new Date(month + '-01'), 'MMMM yyyy')}
                          </p>
                          <p className={`text-sm ${balanceColor} mt-1`}>
                            {formatBalance(balance)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-medium text-base ${balanceColor}`}>
                          £{Math.abs(balance).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedMonths.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Summary</h3>
                  <div className="space-y-3">
                    {selectedMonths.map(month => (
                      <div key={month} className="flex justify-between items-center text-base">
                        <span>{format(new Date(month + '-01'), 'MMMM yyyy')}</span>
                        <span className={`${getBalanceColor(getMonthlyBalance(month))} ml-4`}>
                          £{Math.abs(getMonthlyBalance(month)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center font-semibold text-base">
                        <span>Total Balance</span>
                        <span className={`${getBalanceColor(getTotalBalance())} ml-4`}>
                          £{Math.abs(getTotalBalance()).toFixed(2)}
                        </span>
                      </div>
                      <p className={`text-base mt-2 ${getBalanceColor(getTotalBalance())}`}>
                        {formatBalance(getTotalBalance())}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">All Settled Up!</h3>
              <p className="text-gray-600 text-base">
                You're all caught up. There are no months that need to be settled.
              </p>
            </div>
          )}

          {isModalOpen && (
            <SettlementModal
              months={selectedMonths}
              balance={getTotalBalance()}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedMonths([]);
              }}
            />
          )}
        </div>
      ) : (
        <SettlementHistory />
      )}
    </div>
  );
};

export default Settlement;
