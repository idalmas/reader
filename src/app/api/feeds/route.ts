import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import Parser from 'rss-parser'
import { getAuthenticatedUserId, unauthorized } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { ApiError } from '@/types/database'

const parser = new Parser({
  headers: {
    'User-Agent': 'RSS Reader/1.0',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
  },
})

// GET /api/feeds - List user's feeds
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    const { data: feeds, error } = await supabase
      .from('feeds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(feeds)
  } catch (error: unknown) {
    const apiError = error as ApiError
    console.error('Feed fetch error:', apiError)
    if (apiError.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 })
  }
}

// POST /api/feeds - Add a new feed
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    const { url } = await request.json()
    
    // Fetch the feed content
    let feed
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RSS Reader/1.0',
          'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
        },
      })
      
      if (!response.ok) {
        console.error('Feed fetch error:', response.status, response.statusText)
        return NextResponse.json({ 
          error: 'Failed to fetch feed. Please check the URL and try again.' 
        }, { status: 400 })
      }
      
      const feedText = await response.text()
      feed = await parser.parseString(feedText)
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Feed parsing error:', apiError)
      return NextResponse.json({ 
        error: 'Failed to parse feed. Please check the URL and try again.' 
      }, { status: 400 })
    }
    
    if (!feed || !feed.items) {
      return NextResponse.json({ 
        error: 'Invalid feed format. Please check the URL and try again.' 
      }, { status: 400 })
    }
    
    // Insert the feed
    const { data: newFeed, error: feedError } = await supabase
      .from('feeds')
      .insert({
        url,
        title: feed.title || url,
        user_id: userId,
      })
      .select()
      .single()
    
    if (feedError) {
      console.error('Feed insert error:', feedError)
      throw feedError
    }
    
    // Insert feed items
    if (feed.items && feed.items.length > 0) {
      const items = feed.items.map(item => ({
        feed_id: newFeed.id,
        title: item.title,
        link: item.link,
        description: item.content || item.description,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        status: 'unread' as const,
      }))
      
      const { error: itemsError } = await supabase
        .from('feed_items')
        .insert(items)
      
      if (itemsError) {
        console.error('Feed items insert error:', itemsError)
        throw itemsError
      }
    }
    
    return NextResponse.json(newFeed)
  } catch (error: unknown) {
    const apiError = error as ApiError
    console.error('Feed addition error:', apiError)
    if (apiError.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ 
      error: 'Failed to add feed. Please try again.' 
    }, { status: 500 })
  }
}

// DELETE /api/feeds - Delete a feed
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    const { searchParams } = new URL(request.url)
    const feedId = searchParams.get('id')
    
    if (!feedId) {
      return NextResponse.json({ error: 'Feed ID is required' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('feeds')
      .delete()
      .match({ id: feedId, user_id: userId })
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const apiError = error as ApiError
    console.error('Feed deletion error:', apiError)
    if (apiError.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete feed' }, { status: 500 })
  }
} 