import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// GET /api/locations - Get all locations
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
    // Fetch locations from the database
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('location', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST /api/locations - Create a new location
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
    if (!body.location || typeof body.location !== 'string') {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }

    // Insert the new location
    const { data, error } = await supabase
      .from('locations')
      .insert([{ 
        location: body.location.trim(),
        created_by: user.id 
      }])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A location with this name already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

// PUT /api/locations?id=:id - Update a location
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
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validation
    if (!body.location || typeof body.location !== 'string') {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }

    // Update the location
    const { data, error } = await supabase
      .from('locations')
      .update({ 
        location: body.location.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A location with this name already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// DELETE /api/locations?id=:id - Delete a location
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
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    // Delete the location
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}