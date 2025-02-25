import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(_request: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('userId', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json(settings || {
      userId: session.user.id,
      theme: 'light',
      currency: 'GBP',
      defaultSplit: 'equal',
      notifications: {
        email: true,
        push: false,
        recurring: true
      },
      displayPreferences: {
        defaultView: 'list',
        showTags: true,
        showNotes: true
      }
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = createServerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const updates = await request.json();

    const { data: settings, error } = await supabase
      .from('user_settings')
      .upsert({
        userId: session.user.id,
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
