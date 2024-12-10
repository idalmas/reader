'use client'

import { useState, useEffect } from 'react'
import { AddFeedDialog } from '@/components/AddFeedDialog'
import { type Feed, type FeedItem, type ItemStatus } from '@/types/database'

export default function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [items, setItems] = useState<FeedItem[]>([])
  const [status, setStatus] = useState<ItemStatus>('unread')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch feeds
  useEffect(() => {
    fetchFeeds()
  }, [])

  // Fetch items when status changes
  useEffect(() => {
    fetchItems()
  }, [status])

  async function fetchFeeds() {
    try {
      const res = await fetch('/api/feeds')
      if (!res.ok) throw new Error('Failed to fetch feeds')
      const data = await res.json()
      setFeeds(data)
    } catch (error) {
      setError('Failed to load feeds')
    }
  }

  async function fetchItems() {
    try {
      setLoading(true)
      const res = await fetch(`/api/items?status=${status}`)
      if (!res.ok) throw new Error('Failed to fetch items')
      const data = await res.json()
      setItems(data.items)
    } catch (error) {
      setError('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  async function addFeed(url: string) {
    const res = await fetch('/api/feeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    
    if (!res.ok) {
      throw new Error('Failed to add feed')
    }
    
    await fetchFeeds()
    await fetchItems()
  }

  async function deleteFeed(id: string) {
    if (!confirm('Are you sure you want to delete this feed?')) return
    
    const res = await fetch(`/api/feeds?id=${id}`, {
      method: 'DELETE'
    })
    
    if (res.ok) {
      await fetchFeeds()
      await fetchItems()
    }
  }

  async function updateItemStatus(id: string, newStatus: ItemStatus) {
    const res = await fetch('/api/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    })
    
    if (res.ok) {
      await fetchItems()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Feeds Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Your RSS Feeds</h2>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Add New Feed
            </button>
          </div>
          
          {feeds.length === 0 ? (
            <p className="text-gray-500">No feeds added yet</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {feeds.map((feed) => (
                <li key={feed.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">{feed.title}</h3>
                    <p className="text-sm text-gray-500">{feed.url}</p>
                  </div>
                  <button
                    onClick={() => deleteFeed(feed.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Items Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Feed Items</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setStatus('unread')}
                className={`px-3 py-1 text-sm rounded-md ${
                  status === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setStatus('read')}
                className={`px-3 py-1 text-sm rounded-md ${
                  status === 'read'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Read
              </button>
              <button
                onClick={() => setStatus('archived')}
                className={`px-3 py-1 text-sm rounded-md ${
                  status === 'archived'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Archived
              </button>
            </div>
          </div>
          
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No items found</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="py-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {item.title}
                      </a>
                    </h3>
                    <div className="flex gap-2">
                      {status === 'unread' && (
                        <button
                          onClick={() => updateItemStatus(item.id, 'read')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark as Read
                        </button>
                      )}
                      {status !== 'archived' && (
                        <button
                          onClick={() => updateItemStatus(item.id, 'archived')}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Archive
                        </button>
                      )}
                    </div>
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
          )}
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