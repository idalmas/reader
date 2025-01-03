import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLayout from './AppLayout';

interface Feed {
  id: string;
  title: string;
  link: string;
  created_at: string;
}

interface FeedItem {
  id: string;
  title: string;
  link: string;
  created_at: string;
  status: 'unread' | 'read';
  feed: Feed;
  published_at?: string;
  feedTitle?: string;
  author?: string;
}

interface CacheData {
  items: FeedItem[];
  timestamp: number;
}

const ITEMS_PER_PAGE = 20;
const CACHE_KEY = 'rss_feed_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

type FeedView = 'unread' | 'read';

export default function RSSReader() {
  const searchParams = useSearchParams();
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentView = (searchParams.get('status') as FeedView) || 'unread';

  // Cache management functions
  function getCachedItems(view: FeedView): FeedItem[] | null {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${view}`);
      if (!cached) return null;

      const data: CacheData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(`${CACHE_KEY}_${view}`);
        return null;
      }

      return data.items;
    } catch (err) {
      console.error('Error reading feed cache:', err);
      return null;
    }
  }

  function cacheItems(view: FeedView, items: FeedItem[]) {
    try {
      const cacheData: CacheData = {
        items,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${CACHE_KEY}_${view}`, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error caching feed items:', err);
    }
  }

  // Initial feed fetch
  useEffect(() => {
    async function fetchFeeds() {
      try {
        setLoading(true);

        // Try to get from cache first
        const cachedItems = getCachedItems(currentView);
        if (cachedItems) {
          setAllItems(cachedItems);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/items?status=' + currentView);
        if (!response.ok) throw new Error('Failed to fetch feeds');
        const data = await response.json();
        
        // Sort items by date
        const sortedItems = data.items.sort((a: FeedItem, b: FeedItem) => {
          const dateA = new Date(a.published_at || '').getTime();
          const dateB = new Date(b.published_at || '').getTime();
          return dateB - dateA;
        });

        setAllItems(sortedItems);
        setHasMore(data.page < data.totalPages);
        
        // Cache the items
        cacheItems(currentView, sortedItems);
      } catch (err) {
        console.error('Error fetching feeds:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeeds();
  }, [currentView]); // Refetch when view changes

  // Handle pagination
  useEffect(() => {
    const start = 0;
    const end = page * ITEMS_PER_PAGE;
    const items = allItems.slice(start, end);
    setDisplayedItems(items);
    setHasMore(end < allItems.length);
  }, [page, allItems]);

  function loadMore() {
    setPage(prev => prev + 1);
  }

  // Clear cache when marking as read
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === null) {
        // Clear cache when storage is cleared
        localStorage.removeItem(`${CACHE_KEY}_unread`);
        localStorage.removeItem(`${CACHE_KEY}_read`);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AppLayout>
      <div className="px-2">
        <div className="max-w-[600px] pt-8">
          {displayedItems.map((item) => (
            <article key={item.id} className="border-b border-gray-100">
              <Link 
                href={`/article/${encodeURIComponent(item.link)}?id=${item.id}&currentView=${currentView}`}
                className="block hover:bg-slate-200 transition-colors py-2 px-2"
              >
                <div className="flex flex-col">
                  <h2 className="text-base font-normal">
                    {item.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.feedTitle && (
                      <span className="text-sm text-gray-500">{item.feedTitle}</span>
                    )}
                    {item.author && (
                      <span className="text-sm text-gray-500">• {item.author}</span>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))}

          {!loading && displayedItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {allItems.length === 0 
                ? 'Add some feeds to get started' 
                : currentView === 'unread'
                  ? 'No unread articles'
                  : 'No read articles'}
            </div>
          )}

          {loading && displayedItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Loading feeds...
            </div>
          )}

          {hasMore && !loading && displayedItems.length > 0 && (
            <button
              onClick={loadMore}
              className="w-full py-4 text-sm text-gray-500 hover:text-gray-900"
            >
              Load more articles
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 