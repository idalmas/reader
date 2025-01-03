import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session.userId) {
    throw new Error('Unauthorized');
  }
  return session.userId;
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}