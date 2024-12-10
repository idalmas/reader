import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { IncomingMessage } from 'http'

export async function getAuthenticatedUserId(req: NextRequest) {
  const requestLike = {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url,
    // Add required IncomingMessage properties
    aborted: false,
    httpVersion: '1.1',
    httpVersionMajor: 1,
    httpVersionMinor: 1,
    complete: true,
    connection: null,
    socket: null,
    statusCode: null,
    statusMessage: null,
    readable: true,
    readableEncoding: null,
    readableEnded: false,
    readableFlowing: null,
    readableHighWaterMark: 16384,
    readableLength: 0,
    readableObjectMode: false,
    destroyed: false
  } as unknown as IncomingMessage
  
  const { userId } = getAuth(requestLike)
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return userId
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
} 