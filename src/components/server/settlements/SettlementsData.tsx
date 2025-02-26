import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { format, parseISO } from 'date-fns';
import type { Expense } from '@/types';

interface SettlementSummary {
  id: string;
  date: string;
  amount: number;
  paidBy: string;
  paidTo: string;
  notes?: string;
  status: 'pending' | 'completed';
  expenses: Expense[];
}

interface SettlementStats {
  totalSettlements: number;
  totalAmount: number;
  averageAmount: number;
  byMonth: Record<string, number>;
  byStatus: Record<string, number>;
  recentActivity: SettlementSummary[];
}

interface SettlementsData {
  settlements: SettlementSummary[];
  stats: SettlementStats;
}

async function getSettlementsData() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Server component doesn't need to set cookies
        },
        remove(name: string, options: any) {
          // Server component doesn't need to remove cookies
        },
      },
    }
  );
  
  // Fetch settlements with related expenses
  const { data: rawSettlements, error: settlementsError } = await supabase
    .from('settlements')
    .select(`
      *,
      expenses (*)
    `)
    .order('date', { ascending: false });

  if (settlementsError) throw new Error('Failed to fetch settlements');

  // Fetch all expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*');

  if (expensesError) throw new Error('Failed to fetch expenses');

  // Process settlements data
  const settlements = rawSettlements.map((settlement) => {
    const expensesData = settlement.expenses.map((expenseId: string) => {
      const expense = expenses.find((e) => e.id === expenseId);
      return expense || { id: expenseId, amount: 0 };
    });

    const totalAmount = expensesData.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    
    return {
      id: settlement.id,
      date: format(parseISO(settlement.date), 'yyyy-MM-dd'),
      amount: totalAmount,
      paidBy: settlement.paidBy,
      paidTo: settlement.paidTo,
      notes: settlement.notes,
      status: settlement.status as 'pending' | 'completed',
      expenses: expensesData
    };
  });

  // Calculate settlement stats
  const stats = calculateSettlementStats(settlements);

  return {
    settlements,
    stats,
  };
}

function calculateSettlementStats(settlements: SettlementSummary[]) {
  const totalSettled = settlements.reduce((sum: number, s) => 
    s.status === 'completed' ? sum + s.amount : sum, 0);
  
  const pendingAmount = settlements.reduce((sum: number, s) => 
    s.status === 'pending' ? sum + s.amount : sum, 0);
  
  const byPerson = settlements.reduce((acc: Record<string, number>, s) => {
    if (s.status === 'completed') {
      acc[s.paidBy] = (acc[s.paidBy] || 0) + s.amount;
      acc[s.paidTo] = (acc[s.paidTo] || 0) - s.amount;
    }
    return acc;
  }, {});

  return {
    totalSettled,
    pendingAmount,
    balanceByPerson: byPerson,
  };
}

async function getUnsettledExpenses() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Server component doesn't need to set cookies
        },
        remove(name: string, options: any) {
          // Server component doesn't need to remove cookies
        },
      },
    }
  );
  
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .is('settlementId', null)
    .order('date', { ascending: false });

  if (expensesError) throw new Error('Failed to fetch unsettled expenses');

  // Calculate balances
  const balances = calculateBalances(expenses);

  return {
    unsettledExpenses: expenses,
    balances,
  };
}

function calculateBalances(expenses: Expense[]) {
  const balances = {
    Andres: 0,
    Antonio: 0,
  };

  expenses.forEach(expense => {
    const amount = expense.amount;
    
    // Add to payer's balance
    if (expense.paidBy === 'Andres') {
      balances.Andres += amount;
    } else {
      balances.Antonio += amount;
    }

    // Subtract shares
    if (expense.split === 'equal') {
      balances.Andres -= amount / 2;
      balances.Antonio -= amount / 2;
    } else {
      if (expense.paidBy === 'Andres') {
        balances.Antonio -= amount;
      } else {
        balances.Andres -= amount;
      }
    }
  });

  return balances;
}

export async function SettlementsData() {
  const [settlementsData, unsettledData] = await Promise.all([
    getSettlementsData(),
    getUnsettledExpenses(),
  ]);

  // This component doesn't render anything visible
  // It just provides data to its client components
  return (
    <script
      type="application/json"
      id="settlements-data"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          ...settlementsData,
          ...unsettledData,
        }),
      }}
    />
  );
}
