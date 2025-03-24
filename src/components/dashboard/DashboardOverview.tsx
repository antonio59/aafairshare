'use client';

import { Activity, CreditCard, DollarSign, Plus, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { createStandardBrowserClient } from '@/utils/supabase-client';

interface DashboardOverviewProps {
  userId: string;
}

export function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingSettlements: 0,
    recentExpenses: [] as any[],
    totalSpent: 0,
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const supabase = createStandardBrowserClient();
        
        // Get total expenses count
        const { count: expensesCount, error: expensesError } = await supabase
          .from('expenses')
          .select('id', { count: 'exact', head: false })
          .eq('paid_by', userId);
          
        if (expensesError) throw expensesError;
        
        // Get pending settlements count
        let settlementsCount = 0;
        try {
          const { count, error: settlementsError } = await supabase
            .from('settlements')
            .select('id', { count: 'exact', head: false })
            .eq('status', 'pending');
            
          if (settlementsError) throw settlementsError;
          settlementsCount = count || 0;
        } catch (err) {
          console.warn('Could not fetch settlements count:', err);
        }
        
        // Get recent expenses
        const { data: recentExpenses, error: recentError } = await supabase
          .from('expenses')
          .select('id, amount, date, notes, category_id')
          .order('date', { ascending: false })
          .limit(5);
          
        if (recentError) throw recentError;
        
        // Get total amount spent
        const { data: totalData, error: totalError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('paid_by', userId);
          
        if (totalError) throw totalError;
        
        const totalSpent = totalData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
        
        setStats({
          totalExpenses: expensesCount || 0,
          pendingSettlements: settlementsCount || 0,
          recentExpenses: recentExpenses || [],
          totalSpent,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'Error loading dashboard',
          description: 'There was a problem loading your dashboard data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboardData();
  }, [userId, toast]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your expenses and settlements
          </p>
        </div>
        <Button asChild>
          <Link href="/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.totalExpenses}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time recorded expenses
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${stats.totalSpent.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount you've paid
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Settlements
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.pendingSettlements}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Settlements awaiting action
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.recentExpenses.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recent transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-3 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest expenses and settlements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stats.recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {stats.recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center border-b pb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {expense.notes || 'Unnamed expense'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="font-medium">
                      ${expense.amount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center border rounded-md">
                <p className="text-sm text-muted-foreground">No recent activity found.</p>
                <Link href="/expenses/new" className="text-sm text-blue-600 font-medium mt-2 inline-block">
                  Add your first expense
                </Link>
              </div>
            )}
            
            {!isLoading && stats.recentExpenses.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="link" asChild>
                  <Link href="/expenses">View all expenses</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
