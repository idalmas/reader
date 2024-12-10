import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { RequestLike } from '@clerk/nextjs/dist/types'

export async function getAuthenticatedUserId(req: NextRequest) {
  const requestLike: RequestLike = {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url,
  }
  
  const { userId } = getAuth(requestLike)
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return userId
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
} 