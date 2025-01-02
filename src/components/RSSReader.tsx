import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLayout from './AppLayout';

interface FeedItem {
  id: string;
  title: string;
  link: string;
  content: string;
  pubDate: string;
  published_at?: string;
  author?: string;
  categories?: string[];
  guid: string;
  feedTitle?: string;
  status: 'read' | 'unread' | 'archived';
}

interface Feed {
  id: string;
  title: string;
  url: string;
  user_id: string;
}

interface FeedContent {
  title?: string;
  items: FeedItem[];
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
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentView = (searchParams.get('status') as FeedView) || 'unread';

  // Initial feed fetch
  useEffect(() => {
    async function fetchFeeds() {
      try {
        setLoading(true);
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
              {feeds.length === 0 
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