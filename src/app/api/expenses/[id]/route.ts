import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface RouteParams {
  params: { id: string };
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  console.log(`API: PUT /api/expenses/${params.id} - Starting`);
  const supabase = createClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error(`API: PUT /api/expenses/${params.id} - Unauthorized, no session found`);
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    console.log(`API: PUT /api/expenses/${params.id} - User authenticated:`, session.user.email);

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
    
    console.log(`API: PUT /api/expenses/${params.id} - Expense data:`, JSON.stringify(expenseData));

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
  const supabase = createClient();
  
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
  const supabase = createClient();
  
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
