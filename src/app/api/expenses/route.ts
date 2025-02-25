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
    const formData = await request.formData();
    const expenseData = {
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date'),
      category: formData.get('category'),
      paidBy: formData.get('paidBy'),
      split: formData.get('split'),
      tags: formData.getAll('tags'),
      notes: formData.get('notes'),
    };

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Expense creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = createServerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Build query with filters
    let query = supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    // Apply filters if present
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categories = searchParams.get('categories')?.split(',');
    const tags = searchParams.get('tags')?.split(',');
    const paidBy = searchParams.get('paidBy')?.split(',');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (categories?.length) query = query.in('category', categories);
    if (paidBy?.length) query = query.in('paidBy', paidBy);
    if (minAmount) query = query.gte('amount', parseFloat(minAmount));
    if (maxAmount) query = query.lte('amount', parseFloat(maxAmount));
    if (tags?.length) query = query.overlaps('tags', tags);

    const { data: expenses, error } = await query;

    if (error) throw error;

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Expenses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
