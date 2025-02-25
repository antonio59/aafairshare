import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const tagData = {
      name: formData.get('name'),
      color: formData.get('color'),
      description: formData.get('description'),
    };

    const { data: tag, error } = await supabase
      .from('tags')
      .insert(tagData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Tag creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id, ...updates } = await request.json();

    const { data: tag, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Tag update error:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await request.json();

    // First check if there are any expenses using this tag
    const { data: expenses, error: checkError } = await supabase
      .from('expenses')
      .select('id')
      .contains('tags', [id]);

    if (checkError) throw checkError;

    if (expenses && expenses.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tag that is being used by expenses' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Tag deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
