import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { type ItemStatus, type ApiError, type FeedItemWithFeed } from '@/types/database'

// GET /api/items - List feed items
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ItemStatus || 'unread'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit
    
    const { data: items, error, count } = await supabase
      .from('feed_items')
      .select('*, feeds!inner(*)', { count: 'exact' })
      .eq('feeds.user_id', userId)
      .eq('status', status)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return NextResponse.json({
      items: items as FeedItemWithFeed[],
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error: unknown) {
    const apiError = error as ApiError
    console.error('Items fetch error:', apiError)
    if (apiError.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

// PATCH /api/items - Update item status
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    
    const supabase = createClient();
    
    const { error } = await supabase
      .from('feed_items')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
} 