'use client'

import { useState, useEffect } from 'react'
import { type Feed } from '@/types/database'
import AppLayout from '@/components/AppLayout'

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [addingFeed, setAddingFeed] = useState(false)

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    try {
      const response = await fetch('/api/feeds')
      if (!response.ok) throw new Error('Failed to fetch feeds')
      const data = await response.json()
      setFeeds(data)
    } catch (err) {
      setError('Failed to load feeds')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addFeed = async () => {
    try {
      setAddingFeed(true)
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newFeedUrl })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add feed')
      }
      
      await fetchFeeds()
      setNewFeedUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feed')
    } finally {
      setAddingFeed(false)
    }
  }

  const deleteFeed = async (id: string) => {
    try {
      const response = await fetch(`/api/feeds?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete feed')
      await fetchFeeds()
    } catch (err) {
      setError('Failed to delete feed')
      console.error(err)
    }
  }

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Add new feed */}
          <div className="mb-8 pt-8">
            <div className="flex gap-4">
              <input
                type="url"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                placeholder="Enter RSS feed URL"
                className="flex-1 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-gray-900"
              />
              <button
                onClick={addFeed}
                disabled={addingFeed || !newFeedUrl}
                className="text-sm text-gray-500 hover:text-gray-900 disabled:text-gray-300"
              >
                {addingFeed ? 'Adding...' : 'Add Feed'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Feeds list */}
          {loading ? (
            <p className="text-center py-12 text-gray-500">Loading feeds...</p>
          ) : feeds.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No feeds added yet</p>
          ) : (
            <div className="space-y-6">
              {feeds.map((feed) => (
                <div 
                  key={feed.id} 
                  className="flex items-center justify-between py-4 border-b border-gray-100"
                >
                  <div>
                    <h3 className="font-medium mb-1">{feed.title}</h3>
                    <p className="text-sm text-gray-500">{feed.url}</p>
                  </div>
                  <button
                    onClick={() => deleteFeed(feed.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
} 