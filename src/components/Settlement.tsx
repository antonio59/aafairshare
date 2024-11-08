import React, { useState } from 'react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import MonthSelector from './MonthSelector';
import SettlementModal from './SettlementModal';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const Settlement = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showPastMonths, setShowPastMonths] = useState(false);
  const { currentUser } = useUserStore();
  const {
    getMonthlyBalance,
    isMonthSettled,
    getSettlementDate,
    getSettlementDetails,
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
        return [...prev, month];
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

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Settlement</h2>
        
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        <div className="mt-6">
          <button
            onClick={() => setShowPastMonths(!showPastMonths)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            {showPastMonths ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            {showPastMonths ? 'Hide Past Months' : 'Show Past Months'}
          </button>

          {showPastMonths && (
            <div className="space-y-2 mb-6">
              {pastMonths.map(month => {
                const balance = getMonthlyBalance(month);
                const settled = isMonthSettled(month);
                const settlementDetails = getSettlementDetails(month);

                if (settled) return null; // Skip settled months

                return (
                  <div
                    key={month}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(month)}
                        onChange={() => handleMonthSelect(month)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium">
                          {format(new Date(month + '-01'), 'MMMM yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatBalance(balance)}
                        </p>
                      </div>
                    </div>
                    {settled && settlementDetails && (
                      <div className="text-right text-sm text-gray-600">
                        Settled by {settlementDetails.settledBy}
                        <br />
                        on {format(new Date(settlementDetails.settledAt), 'dd/MM/yyyy')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Selected Months</h3>
            {selectedMonths.length > 0 ? (
              <div className="space-y-2">
                {selectedMonths.map(month => (
                  <div key={month} className="flex justify-between items-center">
                    <span>{format(new Date(month + '-01'), 'MMMM yyyy')}</span>
                    <span>£{Math.abs(getMonthlyBalance(month)).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Balance</span>
                    <span>£{Math.abs(getTotalBalance()).toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{formatBalance(getTotalBalance())}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No months selected</p>
            )}
          </div>

          {selectedMonths.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Settle Selected Months
            </button>
          )}
        </div>

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
    </div>
  );
};

export default Settlement;