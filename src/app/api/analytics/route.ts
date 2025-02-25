import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  const supabase = createServerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'current';
    const categories = searchParams.get('categories')?.split(',') || [];
    const tags = searchParams.get('tags')?.split(',') || [];
    const paidBy = searchParams.get('paidBy')?.split(',') || [];

    // Calculate date range
    const now = new Date();
    let startDate = startOfMonth(now);
    let endDate = endOfMonth(now);
    
    switch (timeRange) {
      case 'last':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case '3':
        startDate = startOfMonth(subMonths(now, 3));
        break;
      case '6':
        startDate = startOfMonth(subMonths(now, 6));
        break;
      case '12':
        startDate = startOfMonth(subMonths(now, 12));
        break;
    }

    // Build query
    let query = supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    // Apply filters
    if (categories.length > 0) {
      query = query.in('category', categories);
    }
    if (paidBy.length > 0) {
      query = query.in('paidBy', paidBy);
    }
    if (tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { data: expenses, error } = await query;

    if (error) throw error;

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
