import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Json } from '@/types/database.types';

interface RouteParams {
  params: { id: string };
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  console.log(`API: PUT /api/expenses/${params.id} - Starting`);
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error(`API: PUT /api/expenses/${params.id} - Unauthorized, no session found`);
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    console.log(`API: PUT /api/expenses/${params.id} - User authenticated:`, session.user.email);

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
      updated_at: new Date().toISOString(),
    };
    
    console.log(`API: PUT /api/expenses/${params.id} - Update data:`, JSON.stringify(expenseData));
    
    const { data: expense, error } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', params.id)
      .select()
      .single();
      
    if (error) {
      console.error(`API: PUT /api/expenses/${params.id} - Database error:`, error);
      throw error;
    }
    
    console.log(`API: PUT /api/expenses/${params.id} - Expense updated successfully`);
    return NextResponse.json(expense);
  } catch (error) {
    console.error(`API: PUT /api/expenses/${params.id} - Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  console.log(`API: DELETE /api/expenses/${params.id} - Starting`);
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error(`API: DELETE /api/expenses/${params.id} - Unauthorized, no session found`);
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    console.log(`API: DELETE /api/expenses/${params.id} - User authenticated:`, session.user.email);

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error(`API: DELETE /api/expenses/${params.id} - Database error:`, error);
      throw error;
    }

    console.log(`API: DELETE /api/expenses/${params.id} - Expense deleted successfully`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`API: DELETE /api/expenses/${params.id} - Error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  console.log(`API: GET /api/expenses/${params.id} - Starting`);
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error(`API: GET /api/expenses/${params.id} - Unauthorized, no session found`);
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    console.log(`API: GET /api/expenses/${params.id} - User authenticated:`, session.user.email);

    const { data: expense, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error(`API: GET /api/expenses/${params.id} - Database error:`, error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expense not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    console.log(`API: GET /api/expenses/${params.id} - Expense retrieved successfully`);
    return NextResponse.json(expense);
  } catch (error) {
    console.error(`API: GET /api/expenses/${params.id} - Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}
