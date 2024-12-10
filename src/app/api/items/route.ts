import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { type ItemStatus, type ApiError } from '@/types/database'

// GET /api/items - List feed items
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) throw new Error('Unauthorized')
    
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
      items,
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
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) throw new Error('Unauthorized')
    
    const { id, status } = await request.json()
    
    // Verify the item belongs to the user
    const { data: item, error: checkError } = await supabase
      .from('feed_items')
      .select('feeds!inner(user_id)')
      .eq('id', id)
      .single()
    
    if (checkError || !item || (item.feeds as any).user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Update the item status
    const { error } = await supabase
      .from('feed_items')
      .update({ status })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const apiError = error as ApiError
    console.error('Item update error:', apiError)
    if (apiError.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
} 