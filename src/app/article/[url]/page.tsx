'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import AppLayout from '@/components/AppLayout'

interface ExtractedArticle {
  title: string;
  content: string;
  textContent: string;
  excerpt: string;
  byline: string;
  length: number;
}

interface ArticleCache {
  article: ExtractedArticle;
  timestamp: number;
}

interface Note {
  id: string;
  content: string;
  selected_text: string;
  created_at: string;
}

const ARTICLE_CACHE_PREFIX = 'article_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function ArticlePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { getToken } = useAuth()
  const [article, setArticle] = useState<ExtractedArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [notes, setNotes] = useState<Note[]>([])

  const itemId = searchParams.get('id')
  const currentView = searchParams.get('currentView') || 'unread'

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const decodedUrl = decodeURIComponent(params.url as string)
        
        // Try to get from cache first
        const cachedData = getCachedArticle(decodedUrl);
        if (cachedData) {
          console.log('Using cached article');
          setArticle(cachedData);
          setLoading(false);
          return;
        }

        const token = await getToken();
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: decodedUrl }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch article')
        }

        const data = await response.json()
        setArticle(data)
        // Cache the article
        cacheArticle(decodedUrl, data);
      } catch (err) {
        console.error('Error fetching article:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.url, getToken])

  // Cache management functions
  function getCachedArticle(url: string): ExtractedArticle | null {
    try {
      const cached = localStorage.getItem(ARTICLE_CACHE_PREFIX + url);
      if (!cached) return null;

      const data: ArticleCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(ARTICLE_CACHE_PREFIX + url);
        return null;
      }

      return data.article;
    } catch (err) {
      console.error('Error reading article cache:', err);
      return null;
    }
  }

  function cacheArticle(url: string, articleData: ExtractedArticle) {
    try {
      const cacheData: ArticleCache = {
        article: articleData,
        timestamp: Date.now(),
      };
      localStorage.setItem(ARTICLE_CACHE_PREFIX + url, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error caching article:', err);
    }
  }

  const markAsRead = async () => {
    if (!itemId || markingAsRead) return;
    
    try {
      setMarkingAsRead(true);
      
      const token = await getToken();
      
      // Start the mark-as-read request but don't await it yet
      const markAsReadPromise = fetch('/api/items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: itemId,
          status: 'read'
        }),
      });

      // Start fetching next article in parallel
      const nextArticlePromise = fetch(`/api/items/next?currentId=${itemId}&status=unread`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Wait for mark-as-read to complete
      const response = await markAsReadPromise;
      if (!response.ok) {
        throw new Error(`Failed to mark article as read: ${response.status}`);
      }

      // Check next article response
      const nextArticleResponse = await nextArticlePromise;
      if (nextArticleResponse.ok) {
        const nextArticle = await nextArticleResponse.json();
        if (nextArticle && nextArticle.link) {
          router.replace(`/article/${encodeURIComponent(nextArticle.link)}?id=${nextArticle.id}&currentView=unread`);
          return;
        }
      }
      
      // If no next article or error, go back to feed
      router.replace('/dashboard');
    } catch (err) {
      console.error('Error marking article as read:', err);
      alert('Failed to mark article as read. Please try again.');
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Fetch notes for the current article
  useEffect(() => {
    const fetchNotes = async () => {
      if (!itemId) return;
      
      try {
        const token = await getToken();
        const response = await fetch(`/api/notes?feed_item_id=${itemId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        console.error('Error fetching notes:', err);
      }
    };
    
    fetchNotes();
  }, [itemId, getToken]);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim());
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  const createNote = async () => {
    if (!itemId || !selectedText) return;
    
    try {
      const token = await getToken();
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feed_item_id: itemId,
          content: selectedText,
          selected_text: selectedText
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create note');
      }
      
      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      setSelectedText('');
      
      // Clear the selection
      window.getSelection()?.removeAllRanges();
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Failed to create note. Please try again.');
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // 'r' key for marking as read
      if (event.key === 'r' && !markingAsRead) {
        markAsRead();
      }
      // 'n' key for creating a note from selection
      if (event.key === 'n' && selectedText) {
        createNote();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [markingAsRead, selectedText]);

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <div className="mb-8 pt-8">
            <Link 
              href="/dashboard" 
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← Feed
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading article...
            </div>
          ) : article ? (
            <article className="mb-16">
              <h1 className="text-2xl font-medium mb-4 leading-snug">{article.title}</h1>
              {article.byline && (
                <p className="text-sm text-gray-500 mb-8">{article.byline}</p>
              )}
              <div 
                className="prose prose-gray max-w-none prose-headings:font-medium prose-a:text-gray-900 prose-a:no-underline hover:prose-a:underline prose-p:text-base prose-headings:text-lg"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex justify-center">
                  <button
                    onClick={markAsRead}
                    disabled={markingAsRead || !itemId}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {markingAsRead ? 'Marking as Read...' : 'Mark as Read (r)'}
                  </button>
                </div>
                {selectedText && (
                  <div className="flex justify-center">
                    <button
                      onClick={createNote}
                      className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Create Note from Selection (n)
                    </button>
                  </div>
                )}
              </div>
              {notes.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium mb-4">Notes</h2>
                  <div className="space-y-4">
                    {notes.map(note => (
                      <div key={note.id} className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-900">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ) : (
            <div className="text-center py-12 text-red-500">
              Failed to load article
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
} 