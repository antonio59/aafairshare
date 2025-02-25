import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { expenseIds, ...settlementData } = body;

    // Start a transaction
    const { data: settlement, error: settlementError } = await supabase
      .from('settlements')
      .insert(settlementData)
      .select()
      .single();

    if (settlementError) throw settlementError;

    // Update expenses with the settlement ID
    const { error: expensesError } = await supabase
      .from('expenses')
      .update({ settlementId: settlement.id })
      .in('id', expenseIds);

    if (expensesError) throw expensesError;

    return NextResponse.json(settlement);
  } catch (error) {
    console.error('Settlement creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create settlement' },
      { status: 500 }
    );
  }
}
