'use client'

import { useState, useEffect, useCallback } from 'react'
import { AddFeedDialog } from '@/components/AddFeedDialog'
import { type Feed } from '@/types/database'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function FeedsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchFeeds = useCallback(async () => {
    try {
      const res = await fetch('/api/feeds')
      if (!res.ok) throw new Error('Failed to fetch feeds')
      const data = await res.json()
      setFeeds(data)
      setError(null)
    } catch (err) {
      setError('Failed to load feeds')
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds])

  async function deleteFeed(id: string) {
    if (!confirm('Are you sure you want to delete this feed?')) return
    
    try {
      const res = await fetch(`/api/feeds?id=${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        await fetchFeeds()
        setError(null)
      } else {
        throw new Error('Failed to delete feed')
      }
    } catch (err) {
      setError('Failed to delete feed')
      console.error(err)
    }
  }

  async function addFeed(url: string) {
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (!res.ok) {
        throw new Error('Failed to add feed')
      }
      
      await fetchFeeds()
      setError(null)
    } catch (err) {
      setError('Failed to add feed')
      throw err
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 pt-20 selection:bg-black selection:text-white ${inter.className}`}>
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex gap-36 relative">
          {/* Left Side - Feed Management */}
          <div className="flex-grow max-w-3xl">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-medium">Your RSS Feeds</h1>
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors"
                >
                  Add New Feed
                </button>
              </div>

              {feeds.length === 0 ? (
                <p className="text-gray-500">No feeds added yet</p>
              ) : (
                <ul className="space-y-6">
                  {feeds.map((feed) => (
                    <li key={feed.id} className="flex justify-between items-start pb-6 border-b border-gray-100 last:border-0">
                      <div>
                        <h3 className="font-medium mb-1">{feed.title}</h3>
                        <p className="text-sm text-gray-500">{feed.url}</p>
                      </div>
                      <button
                        onClick={() => deleteFeed(feed.id)}
                        className="text-sm text-gray-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="w-64 space-y-12 fixed right-8">
            {/* Feed Management */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">Osgiliath</h2>
              </div>
              <div className="flex flex-col gap-3">
                <Link 
                  href="/dashboard"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/feeds"
                  className="px-3 py-1.5 text-sm text-black font-medium"
                >
                  Your Feeds
                </Link>
              </div>
            </div>

            {/* Filter Controls */}
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 mb-6">Filter</h2>
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard?status=unread"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Unread
                </Link>
                <Link
                  href="/dashboard?status=read"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Read
                </Link>
                <Link
                  href="/dashboard?status=archived"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Archived
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {showAddDialog && (
        <AddFeedDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={addFeed}
        />
      )}
    </div>
  )
} 