import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function getAuthenticatedUserId() {
  const headersList = headers()
  const auth = getAuth({ headers: headersList })
  const { userId } = auth
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return userId
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
} 