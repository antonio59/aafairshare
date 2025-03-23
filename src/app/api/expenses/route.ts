import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Pass the cookie store to the server client
    const cookieStore = {
      get: async (name: string) => {
        const cookiesList = await cookies();
        return cookiesList.get(name)?.value;
      }
    };
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        amount: body.amount,
        category_id: body.category,
        location_id: body.location || null,
        notes: body.description,
        date: body.date,
        paid_by: user.id,
        split_type: body.splitType === 'equal' ? 'Equal' : 'No Split'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}