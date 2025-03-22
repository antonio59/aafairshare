'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { calculateSettlement, Expense as CalculatorExpense } from '@/utils/settlementCalculator';
import { createStandardBrowserClient } from '@/utils/supabase-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { SettlementSkeletonGroup } from '@/components/settlements/SettlementSkeleton';
import { SettlementCard } from '@/components/settlements/SettlementCard';
import { Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export interface Settlement {
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

export interface MonthlySettlement {
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

export interface SettlementsSummaryProps {}

export default function SettlementsSummary({}: SettlementsSummaryProps = {}) {
  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active');
  const [monthlySettlements, setMonthlySettlements] = useState<MonthlySettlement[]>([]);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettling, setIsSettling] = useState<string | null>(null);
  const { toast } = useToast();

  const supabase = createStandardBrowserClient();

  const fetchSettlements = useCallback(async () => {
    setIsLoading(true);
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
        
        // Calculate totals for each user for display purposes
        expenses.forEach((expense) => {
          const paidByUserId = expense.paid_by;
          userTotals[paidByUserId].paid += expense.amount;
        });

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Convert expenses to the format expected by our calculator
        const calculatorExpenses: CalculatorExpense[] = expenses.map(expense => ({
          id: expense.id,
          amount: expense.amount,
          date: expense.date,
          paid_by: expense.paid_by,
          split_type: expense.split_type
        }));
        
        // Use our improved settlement calculator for accurate calculations
        const settlement = calculateSettlement(calculatorExpenses, usersData);

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
      toast({
        title: 'Error',
        description: 'Failed to fetch settlements',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, supabase, toast]);

  useEffect(() => {
    void fetchSettlements();
  }, [fetchSettlements]);

  const handleSettleMonth = async (monthYear: string) => {
    setIsSettling(monthYear);
    try {
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
      
      toast({
        title: 'Success',
        description: `Settlements for ${new Date(monthYear + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} marked as settled`,
      });
    } catch (error) {
      console.error('Error settling month:', error);
      toast({
        title: 'Error',
        description: 'Failed to settle month',
        variant: 'destructive',
      });
    } finally {
      setIsSettling(null);
    }
  };

  const toggleExpand = (monthYear: string) => {
    setExpandedMonth(expandedMonth === monthYear ? null : monthYear);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Settlements</CardTitle>
        <CardDescription>
          View and manage financial settlements between users
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={(value: string) => setActiveTab(value as 'active' | 'settled')} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Settlements</TabsTrigger>
            <TabsTrigger value="settled">Settled</TabsTrigger>
          </TabsList>

      <TabsContent value={activeTab} className="mt-0">
        {isLoading ? (
          <SettlementSkeletonGroup />
        ) : monthlySettlements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-lg">No {activeTab === 'active' ? 'active' : 'settled'} settlements found.</p>
            {activeTab === 'active' && (
              <p className="text-sm text-muted-foreground mt-2">Add expenses to generate settlements.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {monthlySettlements.map((monthGroup) => (
              <Card key={monthGroup.month_year} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {new Date(monthGroup.month_year + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    {activeTab === 'active' && (
                      <Button
                        onClick={() => handleSettleMonth(monthGroup.month_year)}
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 dark:border-green-800"
                        disabled={isSettling === monthGroup.month_year}
                      >
                        {isSettling === monthGroup.month_year ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 mr-2" />
                            Mark as Settled
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Total expenses: £{monthGroup.totalAmount.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 pb-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.values(monthGroup.userTotals).map(userData => (
                      <div key={userData.email} className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{userData.name || userData.email}&apos;s Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-lg">
                            <span>Total paid</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">£{userData.paid.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SettlementCard 
                    settlement={{
                      id: `${monthGroup.month_year}-settlement`,
                      from: monthGroup.settlement.from,
                      to: monthGroup.settlement.to,
                      amount: monthGroup.settlement.amount,
                      month: monthGroup.month_year,
                      status: activeTab === 'settled' ? 'completed' : 'pending',
                      created_at: monthGroup.settlements[0]?.created_at || new Date().toISOString(),
                      updated_at: undefined
                    }}
                    className="mt-4 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30"
                    onStatusChange={activeTab === 'active' ? 
                      (_id) => handleSettleMonth(monthGroup.month_year) : undefined
                    }
                  />
                  
                  <div className="space-y-2 pt-4">
                    <Button
                      onClick={() => toggleExpand(monthGroup.month_year)}
                      variant="outline"
                      className="w-full flex justify-between items-center p-3 hover:bg-muted"
                    >
                      <span className="font-medium">Expenses Details</span>
                      <span>
                        {expandedMonth === monthGroup.month_year ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </span>
                    </Button>
                    
                    {expandedMonth === monthGroup.month_year && (
                      <div className="space-y-2 mt-2">
                        {monthGroup.settlements.map((settlement) => (
                          <div key={settlement.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-muted-foreground">
                                {new Date(settlement.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-sm">
                                Paid by: {settlement.paid_by_user?.name || settlement.paid_by_user?.email}
                              </span>
                              <Badge variant="outline" className="w-fit">
                                {settlement.split_type || 'equal'}
                              </Badge>
                            </div>
                            <span className="font-medium">£{settlement.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
  );
}