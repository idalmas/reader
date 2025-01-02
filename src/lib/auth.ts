import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function getAuthenticatedUserId(req: NextRequest) {
  try {
    const session = await auth();
    if (!session.userId) {
      throw new Error('Unauthorized')
    }
    return session.userId
  } catch (error) {
    console.error('Auth error:', error)
    throw new Error('Unauthorized')
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
} 