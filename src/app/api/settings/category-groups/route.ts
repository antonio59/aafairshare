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
    const groupData = {
      name: formData.get('name'),
      description: formData.get('description'),
      color: formData.get('color'),
    };

    const { data: group, error } = await supabase
      .from('category_groups')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(group);
  } catch (error) {
    console.error('Category group creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create category group' },
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

    const { data: group, error } = await supabase
      .from('category_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(group);
  } catch (error) {
    console.error('Category group update error:', error);
    return NextResponse.json(
      { error: 'Failed to update category group' },
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

    // First check if there are any categories using this group
    const { data: categories, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('groupId', id);

    if (checkError) throw checkError;

    if (categories && categories.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete group that has categories' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('category_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Category group deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category group' },
      { status: 500 }
    );
  }
}
