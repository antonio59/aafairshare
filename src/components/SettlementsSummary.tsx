'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Settlement {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  month_year: string;
  split_type: string;
  paid_by_user?: {
    id: string;
    email: string;
    name: string;
  };
  owed_by_user?: {
    id: string;
    email: string;
    name: string;
  };
}

interface MonthlySettlement {
  month_year: string;
  settlements: Settlement[];
  totalAmount: number;
  userTotals: {
    [key: string]: {
      paid: number;
      owed: number;
      email: string;
      name: string;
    };
  };
  settlement: {
    from: string;
    to: string;
    amount: number;
  };
}

export default function SettlementsSummary() {
  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active');
  const [monthlySettlements, setMonthlySettlements] = useState<MonthlySettlement[]>([]);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {});

  const fetchSettlements = useCallback(async () => {
    try {
      // First fetch existing settlements to know which months are already settled
      const { data: settlementsData } = await supabase
        .from('settlements')
        .select('*')
        .eq('is_settled', activeTab === 'settled');

      const settledMonths = new Set(settlementsData?.map(s => s.month_year) || []);

      // Fetch all users first to ensure we include both in calculations
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, name');

      if (!usersData || usersData.length !== 2) {
        console.error('Expected exactly two users');
        return;
      }

      // Then fetch expenses for settlement calculations
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          paid_by_user:paid_by(id, email, name)
        `)
        .order('date', { ascending: false });

      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
        return;
      }

    // Group expenses by month
    interface GroupedExpense {
      id: string;
      amount: number;
      date: string;
      paid_by: string;
      created_at: string;
      split_type: string;
      paid_by_user: {
        id: string;
        email: string;
        name: string;
      };
    }

    const groupedExpenses = expensesData?.reduce((acc: { [key: string]: GroupedExpense[] }, expense) => {
      const monthYear = new Date(expense.date).toISOString().slice(0, 7);
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(expense);
      return acc;
    }, {}) || {};

    // Convert grouped expenses to monthly settlements format
    const monthlySettlements = Object.entries(groupedExpenses)
      .filter(([monthYear]) => activeTab === 'settled' ? settledMonths.has(monthYear) : !settledMonths.has(monthYear))
      .map(([monthYear, expenses]) => {
        // Initialize totals for both users with separate tracking for Equal and No Split
        const userTotals: { [key: string]: { paid: number; owed: number; email: string; name: string } } = {};

        usersData.forEach(user => {
          userTotals[user.id] = {
            paid: 0,
            owed: 0,
            email: user.email,
            name: user.name
          };
        });
        
        // Calculate totals for each user
        expenses.forEach((expense) => {
          const paidByUserId = expense.paid_by;
          const otherUserId = usersData.find(user => user.id !== paidByUserId)?.id;
          if (!otherUserId) return;

          // Record the full amount paid by the paying user
          userTotals[paidByUserId].paid += expense.amount;
        });

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Calculate final settlement
        const settlement = {
          from: '',
          to: '',
          amount: 0
        };

        const [[, user1Data], [, user2Data]] = Object.entries(userTotals);
        
        // Calculate the total amount that should be split
        const totalSplitAmount = expenses.reduce((sum, expense) => {
          if (expense.split_type === 'Equal') {
            return sum + (expense.amount / 2); // Half of equal split expenses
          } else if (expense.split_type === 'No Split') {
            return sum + expense.amount; // Full amount for no split expenses
          }
          return sum;
        }, 0);

        // Compare what each user has paid to determine the final settlement
        if (user1Data.paid > user2Data.paid) {
          settlement.from = user2Data.name || user2Data.email;
          settlement.to = user1Data.name || user1Data.email;
          settlement.amount = totalSplitAmount - user2Data.paid;
        } else {
          settlement.from = user1Data.name || user1Data.email;
          settlement.to = user2Data.name || user2Data.email;
          settlement.amount = totalSplitAmount - user1Data.paid;
        }

        return {
          month_year: monthYear,
          settlements: expenses.map(expense => ({
            id: expense.id,
            amount: expense.amount,
            created_at: expense.created_at,
            updated_at: expense.created_at,
            user_id: expense.paid_by,
            status: 'pending',
            month_year: monthYear,
            paid_by_user: expense.paid_by_user,
            split_type: expense.split_type
          })),
          totalAmount,
          userTotals,
          settlement
        };
      });

      setMonthlySettlements(monthlySettlements);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  }, [activeTab, supabase]);

  useEffect(() => {
    void fetchSettlements();
  }, [fetchSettlements]);

  const handleSettleMonth = async (monthYear: string) => {
    const monthGroup = monthlySettlements.find(m => m.month_year === monthYear);
    if (!monthGroup) return;

    // Create a settlement record based on the expense calculations
    const { settlement, userTotals } = monthGroup;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (settlement.amount > 0 && user) {
      const now = new Date().toISOString();
      
      // Find the user IDs from userTotals
      const [[user1Id, user1Data], [user2Id, user2Data]] = Object.entries(userTotals);
      const paidByUserId = user1Data.paid > user2Data.paid ? user1Id : user2Id;
      const owedByUserId = user1Data.paid > user2Data.paid ? user2Id : user1Id;
      
      await supabase
        .from('settlements')
        .upsert({
          month_year: monthYear,
          amount: settlement.amount,
          is_settled: true,
          settled_date: now,
          user_id: user.id,
          paid_by_user_id: paidByUserId,
          owed_by_user_id: owedByUserId,
          created_at: now,
          updated_at: now
        });
    }

    // Move fetchSettlements inside useEffect to avoid scope issues
    await fetchSettlements();
  };

  const toggleExpand = (monthYear: string) => {
    setExpandedMonth(expandedMonth === monthYear ? null : monthYear);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('active')}
        >
          Active Settlements
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'settled' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('settled')}
        >
          Settled
        </button>
      </div>

      <div className="space-y-6">
        {monthlySettlements.map((monthGroup) => (
          <div key={monthGroup.month_year} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {new Date(monthGroup.month_year + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              {activeTab === 'active' && (
                <button
                  onClick={() => handleSettleMonth(monthGroup.month_year)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Mark as Settled
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {Object.values(monthGroup.userTotals).map(userData => (
                <div key={userData.email} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{userData.name || userData.email}&apos;s Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Total paid</span>
                      <span className="text-green-600">£{userData.paid.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {monthGroup.settlement.amount > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <h4 className="font-medium mb-2">Final Settlement</h4>
                  <div className="flex justify-between text-lg">
                    <span>{monthGroup.settlement.from} owes {monthGroup.settlement.to}</span>
                    <span className="font-medium">£{monthGroup.settlement.amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <button
                  onClick={() => toggleExpand(monthGroup.month_year)}
                  className="w-full flex justify-between items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="font-medium">Expenses</span>
                  <span className="transform transition-transform">
                    {expandedMonth === monthGroup.month_year ? '▼' : '▶'}
                  </span>
                </button>
                
                {expandedMonth === monthGroup.month_year && (
                  <div className="space-y-2 mt-2">
                    {monthGroup.settlements.map((settlement) => (
                      <div key={settlement.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-600">
                            {new Date(settlement.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-sm">
                            Paid by: {settlement.paid_by_user?.name || settlement.paid_by_user?.email}
                          </span>
                          <span className="text-xs text-gray-500">
                            Split type: {settlement.split_type}
                          </span>
                        </div>
                        <span className="font-medium">£{settlement.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}