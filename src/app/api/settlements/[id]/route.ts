import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    const { data, error } = await supabase
      .from('settlements')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Settlement update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settlement' },
      { status: 500 }
    );
  }
}
