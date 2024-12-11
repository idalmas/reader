'use client'

import { useState, useEffect, useCallback } from 'react'
import { AddFeedDialog } from '@/components/AddFeedDialog'
import { type FeedItem, type ItemStatus } from '@/types/database'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [items, setItems] = useState<FeedItem[]>([])
  const [status, setStatus] = useState<ItemStatus>('unread')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/items?status=${status}`)
      if (!res.ok) throw new Error('Failed to fetch items')
      const data = await res.json()
      setItems(data.items)
      setError(null)
    } catch (err) {
      setError('Failed to load items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [status])

  // Fetch items when status changes
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

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
      
      await fetchItems()
      setError(null)
    } catch (err) {
      setError('Failed to add feed')
      throw err
    }
  }

  async function updateItemStatus(id: string, newStatus: ItemStatus) {
    try {
      const res = await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      
      if (res.ok) {
        await fetchItems()
        setError(null)
      } else {
        throw new Error('Failed to update item')
      }
    } catch (err) {
      setError('Failed to update item status')
      console.error(err)
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
          {/* Left Side - Feed Content */}
          <div className="flex-grow max-w-3xl">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-center py-8 text-gray-500">Loading...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-center py-8 text-gray-500">No items found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="py-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gray-600 transition-colors"
                          >
                            {item.title}
                          </a>
                        </h3>
                      </div>
                      {item.description && (
                        <div
                          className="text-gray-600 text-sm prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Side - Controls */}
          <div className="w-64 space-y-12 fixed right-8">
            {/* Navigation */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">Osgiliath</h2>
              </div>
              <div className="flex flex-col gap-3">
                <Link 
                  href="/dashboard"
                  className="px-3 py-1.5 text-sm text-black font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/feeds"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Your Feeds
                </Link>
              </div>
            </div>

            {/* Filter Controls */}
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 mb-6">Filter</h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStatus('unread')}
                  className={`px-3 py-1.5 text-sm text-left ${
                    status === 'unread'
                      ? 'text-black font-medium'
                      : 'text-gray-500 hover:text-gray-900'
                  } transition-colors`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setStatus('read')}
                  className={`px-3 py-1.5 text-sm text-left ${
                    status === 'read'
                      ? 'text-black font-medium'
                      : 'text-gray-500 hover:text-gray-900'
                  } transition-colors`}
                >
                  Read
                </button>
                <button
                  onClick={() => setStatus('archived')}
                  className={`px-3 py-1.5 text-sm text-left ${
                    status === 'archived'
                      ? 'text-black font-medium'
                      : 'text-gray-500 hover:text-gray-900'
                  } transition-colors`}
                >
                  Archived
                </button>
              </div>
            </div>

            {/* Item Actions */}
            {items.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 mb-6">Actions</h2>
                <div className="space-y-3">
                  {status === 'unread' && (
                    <button
                      onClick={() => {
                        items.forEach(item => updateItemStatus(item.id, 'read'))
                      }}
                      className="w-full text-left text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Mark All as Read
                    </button>
                  )}
                  {status !== 'archived' && (
                    <button
                      onClick={() => {
                        items.forEach(item => updateItemStatus(item.id, 'archived'))
                      }}
                      className="w-full text-left text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Archive All
                    </button>
                  )}
                </div>
              </div>
            )}
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