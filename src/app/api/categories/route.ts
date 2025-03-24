import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = await createClient(request, response);
  
  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Fetch categories from the database
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = await createClient(request, response);
  
  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Validation
    if (!body.category || typeof body.category !== 'string') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Insert the new category
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        category: body.category.trim(),
        created_by: user.id 
      }])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories?id=:id - Update a category
export async function PUT(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = await createClient(request, response);
  
  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validation
    if (!body.category || typeof body.category !== 'string') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Update the category
    const { data, error } = await supabase
      .from('categories')
      .update({ 
        category: body.category.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories?id=:id - Delete a category
export async function DELETE(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = await createClient(request, response);
  
  // Check if the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
