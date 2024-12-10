import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { IncomingMessage } from 'http'

export async function getAuthenticatedUserId(req: NextRequest) {
  // Convert cookies to plain object
  const cookieStr = req.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieStr.split(';')
      .map(cookie => cookie.trim().split('='))
      .filter(parts => parts.length === 2)
  )

  // Create a request-like object that satisfies both IncomingMessage and GsspRequest
  const requestLike = {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url,
    cookies,
    // Required IncomingMessage properties
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
    destroyed: false,
    // Stream methods
    on: () => requestLike,
    once: () => requestLike,
    removeListener: () => requestLike,
    off: () => requestLike,
    addListener: () => requestLike,
    removeAllListeners: () => requestLike,
    setMaxListeners: () => requestLike,
    getMaxListeners: () => 10,
    listeners: () => [],
    rawListeners: () => [],
    emit: () => true,
    listenerCount: () => 0,
    prependListener: () => requestLike,
    prependOnceListener: () => requestLike,
    eventNames: () => [],
    // Readable stream methods
    read: () => null,
    setEncoding: () => requestLike,
    pause: () => requestLike,
    resume: () => requestLike,
    isPaused: () => false,
    unpipe: () => requestLike,
    unshift: () => {},
    wrap: () => {},
    push: () => false,
    destroy: () => {},
    pipe: () => requestLike
  } as IncomingMessage & { cookies: { [key: string]: string }, url: string, method: string }
  
  try {
    const { userId } = getAuth(requestLike)
    if (!userId) {
      throw new Error('Unauthorized')
    }
    return userId
  } catch (error) {
    console.error('Auth error:', error)
    throw new Error('Unauthorized')
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
} 