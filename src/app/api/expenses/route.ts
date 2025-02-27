import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Json } from '@/types/database.types';

export async function POST(request: Request) {
  console.log('API: POST /api/expenses - Starting');
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('API: POST /api/expenses - Unauthorized, no session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    console.log('API: POST /api/expenses - User authenticated:', session.user.email);

    const formData = await request.formData();
    
    // Convert form data to database schema format
    const expenseData = {
      description: String(formData.get('description') || ''),
      amount: parseFloat(formData.get('amount') as string),
      date: String(formData.get('date') || ''),
      category_id: formData.get('category') ? String(formData.get('category')) : null,
      paid_by: String(formData.get('paidBy') || ''),
      split: String(formData.get('split') || 'equal') as Json,
      tags: formData.getAll('tags').map(tag => String(tag)),
      notes: formData.get('notes') ? String(formData.get('notes')) : null,
      recurring: Boolean(formData.get('recurring') || false),
      recurring_frequency: formData.get('recurringFrequency') ? String(formData.get('recurringFrequency')) : null,
    };
    
    console.log('API: POST /api/expenses - Expense data:', JSON.stringify(expenseData));

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single();

    if (error) {
      console.error('API: POST /api/expenses - Database error:', error);
      throw error;
    }

    console.log('API: POST /api/expenses - Expense created successfully');
    return NextResponse.json(expense);
  } catch (error) {
    console.error('API: POST /api/expenses - Error:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  console.log('API: GET /api/expenses - Starting');
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('API: GET /api/expenses - Unauthorized, no session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    console.log('API: GET /api/expenses - User authenticated:', session.user.email);
    
    const { searchParams } = new URL(request.url);
    
    // Build query with filters
    let query = supabase.from('expenses').select('*');
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categories = searchParams.getAll('category');
    const tags = searchParams.getAll('tag');
    const paidBy = searchParams.get('paidBy');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    console.log('API: GET /api/expenses - Query params:', { startDate, endDate, categories, tags, paidBy, minAmount, maxAmount });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (categories?.length) query = query.in('category', categories);
    if (tags?.length) query = query.overlaps('tags', tags);
    if (paidBy) query = query.eq('paidBy', paidBy);
    if (minAmount) query = query.gte('amount', parseFloat(minAmount));
    if (maxAmount) query = query.lte('amount', parseFloat(maxAmount));

    const { data: expenses, error } = await query;

    if (error) {
      console.error('API: GET /api/expenses - Database error:', error);
      throw error;
    }

    console.log(`API: GET /api/expenses - Retrieved ${expenses.length} expenses`);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('API: GET /api/expenses - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
