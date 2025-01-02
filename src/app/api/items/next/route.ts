import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { type ItemStatus, type ApiError, type FeedItemWithFeed } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    const { searchParams } = new URL(request.url)
    const currentId = searchParams.get('currentId')
    const status = searchParams.get('status') as ItemStatus || 'unread'
    
    if (!currentId) {
      return NextResponse.json({ error: 'Current item ID is required' }, { status: 400 })
    }

    // Get current item's published_at to find the next one
    const { data: currentItem, error: currentError } = await supabase
      .from('feed_items')
      .select('published_at')
      .eq('id', currentId)
      .single()

    if (currentError) throw currentError

    // Find the next item based on published_at
    const { data: nextItem, error: nextError } = await supabase
      .from('feed_items')
      .select('*, feeds!inner(*)')
      .eq('feeds.user_id', userId)
      .eq('status', status)
      .lt('published_at', currentItem.published_at)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (nextError && nextError.code !== 'PGRST116') { // Ignore "no rows returned" error
      throw nextError
    }

    return NextResponse.json(nextItem || null)
  } catch (error: unknown) {
    const apiError = error as ApiError
    console.error('Next item fetch error:', apiError)
    if (apiError.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch next item' }, { status: 500 })
  }
} 