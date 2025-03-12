import React, { useEffect } from 'react';
import { ArrowUpDown, Info, PoundSterling, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type BalanceStatus = 'positive' | 'negative' | 'neutral';

interface BalanceCardProps {
  title: string;
  value: string;
  status?: BalanceStatus;
  icon: React.ReactNode;
  info: string;
  color: string;
  textColor: string;
  isLoading: boolean;
}

interface MonthData {
  netBalance: number;
  isSettled: boolean;
  [key: string]: any;
}

interface SettlementBalanceCardsProps {
  balances: {
    monthlyExpenses: MonthData[];
    [key: string]: any;
  };
  loading: boolean;
  formatAmount: (amount: number) => string;
}

/**
 * BalanceStatus - Helper function to determine balance status
 * @param {number} balance - The balance amount
 * @returns {string} Status indicator ('positive', 'negative', or 'neutral')
 */
const getBalanceStatus = (balance: number): BalanceStatus => {
  if (balance > 0) return 'positive';
  if (balance < 0) return 'negative';
  return 'neutral';
};

/**
 * Balance Card component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.value - Value to display
 * @param {string} props.status - Status indicator
 * @param {Element} props.icon - Icon element
 * @param {string} props.info - Tooltip text
 * @param {string} props.color - Background color
 * @param {string} props.textColor - Text color
 * @param {boolean} props.isLoading - Loading state
 */
export const BalanceCard: React.FC<BalanceCardProps> = ({ 
  title, 
  value, 
  status, 
  icon, 
  info, 
  color, 
  textColor, 
  isLoading 
}) => {
  return (
    <div className={`${color} p-6 rounded-xl shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-1">
            <h2 className={`text-lg font-semibold ${textColor}`}>{title}</h2>
            <div className="group relative">
              <Info size={16} className="text-gray-400 cursor-help" aria-hidden="true" />
              <div 
                className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-white p-2 rounded shadow-lg text-xs text-gray-600 w-48 z-10"
                role="tooltip"
              >
                {info}
              </div>
            </div>
          </div>
          <div className="mt-1 flex items-center space-x-2">
            {isLoading ? (
              <div className="animate-pulse h-8 w-28 bg-gray-200 rounded"></div>
            ) : (
              <>
                <p className="text-2xl font-bold">{value}</p>
                {status && (
                  <span>
                    {status === 'positive' && <ArrowUpRight className="text-green-500" aria-hidden="true" />}
                    {status === 'negative' && <ArrowDownRight className="text-red-500" aria-hidden="true" />}
                  </span>
                )}
              </>
            )}
          </div>
          
          {status === 'positive' && <p className="text-xs text-green-600 mt-1">You are owed money</p>}
          {status === 'negative' && <p className="text-xs text-red-600 mt-1">You owe money</p>}
          {status === 'neutral' && <p className="text-xs text-gray-500 mt-1">All settled up</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * Settlement Balance Cards component
 * @param {Object} props - Component props
 * @param {Object} props.balances - Balance data
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.formatAmount - Function to format currency
 */
const SettlementBalanceCards: React.FC<SettlementBalanceCardsProps> = ({ balances, loading, formatAmount }) => {
  // Calculate total unsettled amount from monthly expenses
  const calculateTotalUnsettled = (): number => {
    // Safety check - ensure we have monthlyExpenses array
    if (!balances || !Array.isArray(balances.monthlyExpenses)) {
      console.log('No valid monthlyExpenses array found', balances);
      return 0;
    }
    
    try {
      // Only consider unsettled months where the current user owes money (negative balance)
      return balances.monthlyExpenses
        .filter((month: MonthData) => {
          // Ensure month is a valid object with netBalance property
          if (!month || typeof month.netBalance !== 'number') {
            console.log('Invalid month object', month);
            return false;
          }
          // Only include months where the user owes money (negative netBalance)
          // and the month is not already settled
          return month.netBalance < 0 && !month.isSettled;
        })
        .reduce((total: number, month: MonthData) => {
          // Safely add the absolute value of netBalance
          const absBalance = Math.abs(Number(month.netBalance) || 0);
          return total + absBalance;
        }, 0);
    } catch (err) {
      console.error('Error calculating total unsettled amount:', err);
      return 0;
    }
  };
  
  // Calculate user's final net balance
  const calculateNetBalance = (): number => {
    // Safety check - ensure we have monthlyExpenses array
    if (!balances || !Array.isArray(balances.monthlyExpenses)) {
      console.log('No valid monthlyExpenses array found for net balance', balances);
      return 0;
    }
    
    try {
      // Sum all net balances from unsettled months
      return balances.monthlyExpenses
        .filter((month: MonthData) => {
          // Ensure month is a valid object
          if (!month || typeof month.netBalance !== 'number') {
            console.log('Invalid month object for net balance', month);
            return false;
          }
          // Only include months that aren't settled yet
          return !month.isSettled;
        })
        .reduce((total: number, month: MonthData) => {
          // Safely add the netBalance (convert to number if needed)
          return total + (Number(month.netBalance) || 0);
        }, 0);
    } catch (err) {
      console.error('Error calculating net balance:', err);
      return 0;
    }
  };
  
  // Log the values for debugging
  useEffect(() => {
    console.log('SettlementBalanceCards received balances:', balances);
    if (balances) {
      const totalUnsettled = calculateTotalUnsettled();
      const netBalance = calculateNetBalance();
      console.log('Calculated total unsettled:', totalUnsettled);
      console.log('Calculated net balance:', netBalance);
    }
  }, [balances, calculateTotalUnsettled, calculateNetBalance]);

  // Safely calculate values with fallbacks to 0
  const totalUnsettled = calculateTotalUnsettled() || 0;
  const netBalance = calculateNetBalance() || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BalanceCard 
        title="Total Unsettled"
        value={loading ? "Loading..." : formatAmount(totalUnsettled)}
        status={totalUnsettled > 0 ? 'negative' : 'neutral'}
        icon={<PoundSterling className="text-emerald-500" aria-hidden="true" />}
        info="Total amount that needs to be settled between users"
        color="bg-emerald-50"
        textColor="text-emerald-700"
        isLoading={loading}
      />
      
      <BalanceCard 
        title="Your Balance" 
        value={loading ? "Loading..." : formatAmount(netBalance)}
        status={getBalanceStatus(netBalance)}
        icon={<ArrowUpDown className="text-rose-500" aria-hidden="true" />} 
        info="Your current balance (positive if you are owed money, negative if you owe)" 
        color="bg-rose-50"
        textColor="text-rose-700"
        isLoading={loading}
      />
    </div>
  );
};

export default SettlementBalanceCards; 