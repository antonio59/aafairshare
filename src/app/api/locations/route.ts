import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// UUID validation function
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data: locations, error } = await supabase
      .from('locations')
      .select('id, location')
      .order('location');

    if (error) throw error;
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { location } = await request.json();
    if (!location) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('locations')
      .insert([{ location }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Location already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { location } = await request.json();

    if (!id || !location) {
      return NextResponse.json(
        { error: 'Location ID and new location name are required' },
        { status: 400 }
      );
    }

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid location ID format' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('locations')
      .update({ location })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid location ID format' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}