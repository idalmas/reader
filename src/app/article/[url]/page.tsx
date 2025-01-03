'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import AppLayout from '@/components/AppLayout'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [noteContent, setNoteContent] = useState('')

  const itemId = searchParams.get('id')

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const decodedUrl = decodeURIComponent(params.url as string)
        
        // Only check cache on client side
        if (typeof window !== 'undefined') {
          const cachedData = getCachedArticle(decodedUrl);
          if (cachedData) {
            console.log('Using cached article');
            setArticle(cachedData);
            setLoading(false);
            return;
          }
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
        // Only cache on client side
        if (typeof window !== 'undefined') {
          cacheArticle(decodedUrl, data);
        }
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

  const markAsRead = useCallback(async () => {
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
  }, [itemId, markingAsRead, getToken, router]);

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
    const handleMouseup = () => {
      if (showNoteDialog) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const articleContent = document.querySelector('.prose');
      if (!articleContent) return;

      // Check if the selection intersects with the article content
      const articleRect = articleContent.getBoundingClientRect();
      const selectionRect = range.getBoundingClientRect();

      // If the selection doesn't overlap with the article, ignore it
      if (selectionRect.bottom < articleRect.top || 
          selectionRect.top > articleRect.bottom ||
          selectionRect.right < articleRect.left || 
          selectionRect.left > articleRect.right) {
        return;
      }

      const selectedStr = selection.toString().trim();
      if (selectedStr) {
        setSelectedText(selectedStr);
      }
    };

    document.addEventListener('mouseup', handleMouseup);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseup);
    };
  }, [showNoteDialog]);

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
          content: noteContent || selectedText,
          selected_text: selectedText
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create note');
      }
      
      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      setNoteContent('');
      setShowNoteDialog(false);
      // Keep the selection active
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Failed to create note. Please try again.');
    }
  };

  // Add dialog close handler
  const handleDialogChange = (open: boolean) => {
    setShowNoteDialog(open);
    if (!open) {
      setNoteContent('');
      // Don't clear selectedText when closing dialog
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore shortcuts if we're typing in a textarea or input
      if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
        return;
      }

      // 'r' key for marking as read
      if (event.key === 'r' && !markingAsRead) {
        markAsRead();
      }
      // 'n' key for creating a note from selection
      if (event.key === 'n' && selectedText) {
        setNoteContent('');
        setShowNoteDialog(true);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [markingAsRead, selectedText, markAsRead]);

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8 flex">
        <div className="max-w-xl flex-1">
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
              <div className="mt-8 flex justify-center">
                <button
                  onClick={markAsRead}
                  disabled={markingAsRead || !itemId}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {markingAsRead ? 'Marking as Read...' : 'Mark as Read (r)'}
                </button>
              </div>
            </article>
          ) : (
            <div className="text-center py-12 text-red-500">
              Failed to load article
            </div>
          )}
        </div>

        {/* Notes sidebar */}
        <div className="w-80 pl-8 pt-8 hidden lg:block">
          <div className="sticky top-8">
            <h2 className="text-lg font-medium mb-4">Notes</h2>
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map(note => (
                  <div key={note.id} className="p-4 bg-gray-50 rounded-md">
                    {note.selected_text && (
                      <p className="text-sm text-gray-500 italic mb-2">"{note.selected_text}"</p>
                    )}
                    <p className="text-sm text-gray-900">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Select text and press &apos;n&apos; to create a note
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Note creation dialog */}
      <Dialog open={showNoteDialog} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedText && (
              <div className="mb-4">
                <label className="text-sm text-gray-500">Selected Text:</label>
                <p className="text-sm mt-1 italic">&quot;{selectedText}&quot;</p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">Note:</label>
              <Textarea
                value={noteContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNoteContent(e.target.value)}
                placeholder="Add your note here..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowNoteDialog(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={createNote}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
            >
              Save Note
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
} 