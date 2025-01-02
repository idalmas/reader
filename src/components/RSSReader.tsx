import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from './AppLayout';

interface FeedItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  author?: string;
  categories?: string[];
  guid: string;
  feedTitle?: string;
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

export default function RSSReader() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Cache management functions
  const getCachedData = (): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error reading cache:', err);
      return null;
    }
  };

  const setCachedData = (items: FeedItem[]) => {
    try {
      const cacheData: CacheData = {
        items,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error setting cache:', err);
    }
  };

  // Fetch feed content
  async function fetchFeedContent(feed: Feed): Promise<FeedContent | null> {
    try {
      const response = await fetch('/api/rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedUrl: feed.url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      return response.json();
    } catch (err) {
      console.error(`Error fetching feed ${feed.url}:`, err);
      return null;
    }
  }

  // Initial feed fetch
  useEffect(() => {
    async function fetchFeeds() {
      try {
        setLoading(true);

        // Try to get cached data first
        const cachedData = getCachedData();
        if (cachedData) {
          console.log('Using cached feed data');
          setAllItems(cachedData.items);
          setLoading(false);
          
          // Fetch fresh data in the background
          fetchFreshData();
          return;
        }

        await fetchFreshData();
      } catch (err) {
        console.error('Error fetching feeds:', err);
        setLoading(false);
      }
    }

    async function fetchFreshData() {
      try {
        const response = await fetch('/api/feeds');
        if (!response.ok) throw new Error('Failed to fetch feeds');
        const data = await response.json();
        setFeeds(data);
        
        // Fetch content for feeds in parallel batches
        const batchSize = 3;
        const newFeedItems: FeedItem[] = [];
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          const feedPromises = batch.map(fetchFeedContent);
          const feedResults = await Promise.all(feedPromises);
          
          feedResults.forEach((feedContent, index) => {
            if (feedContent?.items) {
              const itemsWithFeedTitle = feedContent.items.map((item: FeedItem) => ({
                ...item,
                feedTitle: feedContent.title || batch[index].title,
              }));
              newFeedItems.push(...itemsWithFeedTitle);
            }
          });
        }

        // Sort all items by date
        const sortedItems = newFeedItems.sort((a, b) => {
          const dateA = new Date(a.pubDate).getTime();
          const dateB = new Date(b.pubDate).getTime();
          return dateB - dateA;
        });

        setAllItems(sortedItems);
        setCachedData(sortedItems);
      } catch (err) {
        console.error('Error fetching fresh data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeeds();
  }, []); // Only run on mount

  // Handle pagination separately
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
            <article key={item.guid} className="border-b border-gray-100">
              <Link 
                href={`/article/${encodeURIComponent(item.link)}`}
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
              {feeds.length === 0 ? 'Add some feeds to get started' : 'No articles found'}
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