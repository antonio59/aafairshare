import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { format, parseISO } from 'date-fns';
import type { Settlement, Expense } from '@/types';

interface SettlementSummary {
  id: string;
  date: string;
  amount: number;
  paidBy: string;
  paidTo: string;
  notes: string;
  status: 'pending' | 'completed';
  expenses: Expense[];
}

async function getSettlementsData() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
  
  // Fetch settlements with related expenses
  const { data: settlements, error: settlementsError } = await supabase
    .from('settlements')
    .select(`
      *,
      expenses (*)
    `)
    .order('date', { ascending: false });

  if (settlementsError) throw new Error('Failed to fetch settlements');

  // Calculate settlement summaries
  const summaries = settlements.map((settlement: Settlement & { expenses: Expense[] }) => {
    const totalAmount = settlement.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    return {
      id: settlement.id,
      date: format(parseISO(settlement.date), 'yyyy-MM-dd'),
      amount: totalAmount,
      paidBy: settlement.paidBy,
      paidTo: settlement.paidTo,
      notes: settlement.notes,
      status: settlement.status,
      expenses: settlement.expenses,
    };
  });

  // Calculate overall statistics
  const stats = calculateSettlementStats(summaries);

  return {
    settlements: summaries,
    stats,
  };
}

function calculateSettlementStats(settlements: SettlementSummary[]) {
  const totalSettled = settlements.reduce((sum, s) => 
    s.status === 'completed' ? sum + s.amount : sum, 0);
  
  const pendingAmount = settlements.reduce((sum, s) => 
    s.status === 'pending' ? sum + s.amount : sum, 0);
  
  const byPerson = settlements.reduce((acc, s) => {
    if (s.status === 'completed') {
      acc[s.paidBy] = (acc[s.paidBy] || 0) + s.amount;
      acc[s.paidTo] = (acc[s.paidTo] || 0) - s.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalSettled,
    pendingAmount,
    balanceByPerson: byPerson,
  };
}

async function getUnsettledExpenses() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
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
