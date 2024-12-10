import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function getAuthenticatedUserId() {
  const { userId } = getAuth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return userId
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
} 