import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { ApiError } from '@/types/database'

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    const { feed_item_id, content, selected_text } = await request.json()

    if (!feed_item_id || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        feed_item_id,
        user_id: userId,
        content,
        selected_text
      })
      .select()
      .single()

    if (error) {
      console.error('Note creation error:', error)
      throw error
    }

    return NextResponse.json(note)
  } catch (error: unknown) {
    const apiError = error as ApiError
    console.error('Note creation error:', apiError)
    if (apiError.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ 
      error: 'Failed to create note. Please try again.' 
    }, { status: 500 })
  }
}

// GET /api/notes - Get notes for a feed item
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()
    const { searchParams } = new URL(request.url)
    const feed_item_id = searchParams.get('feed_item_id')

    if (!feed_item_id) {
      return NextResponse.json({ 
        error: 'Missing feed_item_id parameter' 
      }, { status: 400 })
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('feed_item_id', feed_item_id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Notes fetch error:', error)
      throw error
    }

    return NextResponse.json(notes)
  } catch (error: unknown) {
    const apiError = error as ApiError
    console.error('Notes fetch error:', apiError)
    if (apiError.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ 
      error: 'Failed to fetch notes. Please try again.' 
    }, { status: 500 })
  }
} 