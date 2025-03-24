import { Plus } from 'lucide-react';
import Link from 'next/link';

import type { Expense } from '@/types/supabase';

import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  // Create a supabase client - auth check is done in the layout
  const supabase = await createClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch quick stats
  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, amount')
    .eq('paid_by', user?.id)
    .order('created_at', { ascending: false })
    .limit(5);
    
  const totalExpenses = expenses?.length || 0;
  const totalSpent = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
  
  // Fetch settlements stats
  let totalSettlements = 0;
  try {
    const { count } = await supabase
      .from('settlements')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
      
    totalSettlements = count || 0;
  } catch (error) {
    console.error('Error fetching settlements:', error);
  }
  
  // Fetch users stats
  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500 max-w-2xl">
            Welcome back! Here's an overview of your expenses.
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <Link href="/expenses/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>
      
      <DashboardCards 
        totalExpenses={totalExpenses}
        totalSpent={totalSpent}
        totalSettlements={totalSettlements}
        totalUsers={totalUsers || 0}
      />
      
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity expenses={expenses as Expense[] | null} />
      </div>
    </div>
  );
}