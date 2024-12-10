import { useState } from 'react'

export function AddFeedDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (url: string) => Promise<void>
}) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await onAdd(url)
      onClose()
    } catch (error) {
      setError('Failed to add feed. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-medium mb-4">Add New Feed</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              RSS Feed URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com/feed.xml"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 