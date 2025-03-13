import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Check, Loader, BarChart2, Calendar, Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { 
  calculateUserBalances,
  getUserSettlements,
  createSettlement,
  createPartialSettlement,
  deleteSettlement
} from '../api/settlementApi';
import { 
  BalanceData, 
  MonthlySettlementSummary, 
  Settlement, 
  SettlementData 
} from '../../../core/types/settlements';
import { useAuth } from '../../../core/contexts/AuthContext';
import { formatAmount, formatCurrency } from '../../../utils/currencyUtils';
import { ErrorBoundary } from '../../shared/components';

interface SettlementsPageProps {
  className?: string;
}

/**
 * Balance Card component for displaying financial summary
 */
const BalanceCard = ({ 
  title, 
  value, 
  icon, 
  colorClass = 'bg-blue-50 text-blue-500'
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  colorClass?: string;
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className={`p-2 rounded-md ${colorClass}`}>
        {icon}
      </div>
    </div>
    <div className="text-xl font-bold text-gray-800">
      {value}
    </div>
  </div>
);

/**
 * Monthly Summary component for displaying expense summary by month
 */
const MonthlySummary = ({ 
  month, 
  totalAmount, 
  netBalance, 
  formatCurrency, 
  isSettled,
  onSettle,
  onUnsettle,
  onPartialSettle
}: { 
  month: string; 
  totalAmount: number; 
  netBalance: number;
  formatCurrency: (amount: number) => string;
  isSettled: boolean;
  onSettle: () => void;
  onUnsettle: () => void;
  onPartialSettle: (amount: number) => void;
}) => {
  const [showPartialForm, setShowPartialForm] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');

  const handlePartialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(partialAmount);
    if (!isNaN(amount) && amount > 0) {
      onPartialSettle(amount);
      setShowPartialForm(false);
      setPartialAmount('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">{month}</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isSettled 
            ? 'bg-green-100 text-green-800' 
            : 'bg-amber-100 text-amber-800'
        }`}>
          {isSettled ? 'Settled' : 'Unsettled'}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Expenses:</span>
          <span className="font-medium">{formatCurrency(totalAmount)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Net Balance:</span>
          <span className={`font-medium ${
            netBalance > 0 
              ? 'text-green-600' 
              : netBalance < 0 
                ? 'text-red-600' 
                : 'text-gray-600'
          }`}>
            {formatCurrency(Math.abs(netBalance))}
            {netBalance !== 0 && (
              <span className="text-xs ml-1">
                {netBalance > 0 ? '(you are owed)' : '(you owe)'}
              </span>
            )}
          </span>
        </div>
      </div>
      
      {!isSettled && netBalance !== 0 && (
        <div className="space-y-2">
          {!showPartialForm ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onSettle}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                type="button"
              >
                Settle Full Amount
              </button>
              
              <button
                onClick={() => setShowPartialForm(true)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                type="button"
              >
                Partial Settlement
              </button>
            </div>
          ) : (
            <form onSubmit={handlePartialSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="Amount"
                  step="0.01"
                  min="0.01"
                  max={Math.abs(netBalance).toString()}
                  className="p-2 border border-gray-300 rounded w-full text-sm"
                  required
                />
                
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Submit
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPartialForm(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      
      {isSettled && (
        <button
          onClick={onUnsettle}
          className="px-3 py-1.5 bg-red-100 text-red-800 text-xs rounded-md hover:bg-red-200 transition-colors"
          type="button"
        >
          Unsettle
        </button>
      )}
    </div>
  );
};

/**
 * Settlement History Item component
 */
const SettlementHistoryItem = ({
  settlement,
  formatCurrency,
  onDelete
}: {
  settlement: Settlement;
  formatCurrency: (amount: number) => string;
  onDelete: () => void;
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3">
    <div className="flex justify-between items-center">
      <div>
        <div className="text-gray-800 font-medium">{settlement.month_year}</div>
        <div className="text-xs text-gray-500">
          {new Date(settlement.created_at).toLocaleDateString()} • 
          <span className={`ml-1 ${
            settlement.status === 'completed' 
              ? 'text-green-600' 
              : 'text-amber-600'
          }`}>
            {settlement.status === 'completed' ? 'Complete' : 'Partial'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold">
          {formatCurrency(settlement.amount)}
        </div>
        
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
          aria-label="Delete settlement"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

/**
 * SettlementsPage component for managing user settlements
 */
function SettlementsPage({ className = '' }: SettlementsPageProps) {
  const { user } = useAuth();
  // formatAmount is now imported directly
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [settlements, setSettlements] = useState<SettlementData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  
  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load balances and settlements data
      const [balancesData, settlementsData] = await Promise.all([
        calculateUserBalances(),
        getUserSettlements()
      ]);
      
      setBalances(balancesData);
      setSettlements(settlementsData);
    } catch (error: any) {
      console.error('Error loading settlements data:', error);
      setError(error.message || 'Failed to load settlements data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Handle settlement creation
  const handleSettle = useCallback(async (monthYear: string, netBalance: number) => {
    try {
      setLoading(true);
      
      await createSettlement(monthYear, Math.abs(netBalance));
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Error creating settlement:', error);
      setError(error.message || 'Failed to create settlement');
      setLoading(false);
    }
  }, [loadData]);
  
  // Handle partial settlement
  const handlePartialSettle = useCallback(async (monthYear: string, amount: number) => {
    try {
      setLoading(true);
      
      await createPartialSettlement(monthYear, amount);
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Error creating partial settlement:', error);
      setError(error.message || 'Failed to create partial settlement');
      setLoading(false);
    }
  }, [loadData]);
  
  // Handle settlement deletion
  const handleDeleteSettlement = useCallback(async (id: string) => {
    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this settlement?')) {
        return;
      }
      
      setLoading(true);
      
      await deleteSettlement(id);
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Error deleting settlement:', error);
      setError(error.message || 'Failed to delete settlement');
      setLoading(false);
    }
  }, [loadData]);
  
  // Calculate totals
  const totals = {
    totalExpenses: balances?.monthlyExpenses.reduce((sum, month) => sum + month.total, 0) || 0,
    totalOwe: balances?.monthlyExpenses
      .filter(month => month.netBalance < 0 && !month.isSettled)
      .reduce((sum, month) => sum + Math.abs(month.netBalance), 0) || 0,
    totalOwed: balances?.monthlyExpenses
      .filter(month => month.netBalance > 0 && !month.isSettled)
      .reduce((sum, month) => sum + month.netBalance, 0) || 0,
    settledCount: balances?.monthlyExpenses.filter(month => month.isSettled).length || 0
  };
  
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading settlements data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-red-50 text-red-700 p-4 rounded-lg ${className}`}>
        <h3 className="text-lg font-medium mb-2">Error loading settlements</h3>
        <p>{error}</p>
        <button 
          onClick={loadData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary fallback={<div>Something went wrong with settlements</div>}>
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Settlements</h1>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <BalanceCard
            title="Total Expenses"
            value={formatAmount(totals.totalExpenses)}
            icon={<BarChart2 size={18} />}
            colorClass="bg-blue-50 text-blue-500"
          />
          
          <BalanceCard
            title="You Owe"
            value={formatAmount(totals.totalOwe)}
            icon={<ArrowUp size={18} />}
            colorClass="bg-red-50 text-red-500"
          />
          
          <BalanceCard
            title="Owed to You"
            value={formatAmount(totals.totalOwed)}
            icon={<ArrowDown size={18} />}
            colorClass="bg-green-50 text-green-500"
          />
          
          <BalanceCard
            title="Settled Months"
            value={totals.settledCount.toString()}
            icon={<Check size={18} />}
            colorClass="bg-green-100 text-green-600"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Summaries */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium mb-4 text-gray-800">Monthly Balances</h2>
            
            {balances && balances.monthlyExpenses.length > 0 ? (
              <div className="space-y-4">
                {balances.monthlyExpenses.map((month) => (
                  <MonthlySummary
                    key={month.month}
                    month={month.month}
                    totalAmount={month.total}
                    netBalance={month.netBalance}
                    formatCurrency={formatAmount}
                    isSettled={month.isSettled}
                    onSettle={() => handleSettle(month.month, month.netBalance)}
                    onUnsettle={() => month.settlementId && handleDeleteSettlement(month.settlementId)}
                    onPartialSettle={(amount) => handlePartialSettle(month.month, amount)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No expenses found</h3>
                <p className="text-gray-600">Add some expenses to see monthly balances</p>
              </div>
            )}
          </div>
          
          {/* Settlement History */}
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-800">Settlement History</h2>
            
            {settlements && settlements.settlements.length > 0 ? (
              <div className="space-y-2">
                {settlements.settlements.map((settlement) => (
                  <SettlementHistoryItem
                    key={settlement.id}
                    settlement={settlement}
                    formatCurrency={formatAmount}
                    onDelete={() => handleDeleteSettlement(settlement.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No settlement history</h3>
                <p className="text-gray-600">Settlements will appear here once you create them</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default SettlementsPage;
