import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { IncomingMessage } from 'http'

export async function getAuthenticatedUserId(req: NextRequest) {
  try {
    // Convert cookies to plain object with better error handling
    const cookieStr = req.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStr.split(';')
        .map(cookie => {
          try {
            const parts = cookie.trim().split('=')
            if (parts.length !== 2) return []
            // Safely decode the cookie value
            return [parts[0], decodeURIComponent(parts[1])]
          } catch {
            // If decoding fails, return empty array to be filtered out
            return []
          }
        })
        .filter(Array.isArray)
    )

    // Ensure required properties exist
    if (!req.method || !req.url) {
      throw new Error('Invalid request: missing method or url')
    }

    // Create a request-like object that satisfies both IncomingMessage and GsspRequest
    const requestLike = {
      // Ensure headers are lowercase for consistency with Node.js
      headers: Object.fromEntries(
        Array.from(req.headers.entries()).map(([k, v]) => [k.toLowerCase(), v])
      ),
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
      // Additional IncomingMessage properties
      headersDistinct: {},
      rawHeaders: [],
      trailers: {},
      trailersDistinct: {},
      rawTrailers: [],
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
    }

    const authRequest = requestLike as unknown as IncomingMessage & { 
      cookies: { [key: string]: string }, 
      url: string, 
      method: string 
    }

    const { userId } = getAuth(authRequest)
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