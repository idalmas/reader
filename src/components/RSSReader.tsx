import { useState, useEffect, useCallback } from 'react';
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

export default function RSSReader() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeedContent = async (url: string): Promise<FeedContent> => {
    const response = await fetch('/api/rss', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedUrl: url }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch feed');
    }

    return response.json();
  };

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feeds');
      if (!response.ok) throw new Error('Failed to fetch feeds');
      const data = await response.json();
      setFeeds(data);
      
      // Fetch content for all feeds
      const allFeedItems: FeedItem[] = [];
      await Promise.all(data.map(async (feed: Feed) => {
        try {
          const feedContent = await fetchFeedContent(feed.url);
          if (feedContent?.items) {
            const itemsWithFeedTitle = feedContent.items.map((item: FeedItem) => ({
              ...item,
              feedTitle: feedContent.title || feed.title,
            }));
            allFeedItems.push(...itemsWithFeedTitle);
          }
        } catch (err) {
          console.error(`Error fetching feed ${feed.url}:`, err);
        }
      }));

      // Sort all items by date
      const sortedItems = allFeedItems.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA; // Most recent first
      });

      setAllItems(sortedItems);
    } catch (err) {
      console.error('Error fetching feeds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  return (
    <AppLayout>
      <div className="px-2">
        <div className="max-w-[600px] pt-8">
          {allItems.map((item) => (
            <article key={item.guid} className="border-b border-gray-100">
              <Link 
                href={`/article/${encodeURIComponent(item.link)}`}
                className="block hover:bg-slate-200 transition-colors py-2 px-2"
              >
                <div className="flex flex-col">
                  <h2 className="text-base font-normal">
                    {item.title}
                  </h2>
                  {item.author && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.author}</p>
                  )}
                </div>
              </Link>
            </article>
          ))}

          {!loading && allItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {feeds.length === 0 ? 'Add some feeds to get started' : 'No articles found'}
            </div>
          )}

          {loading && (
            <div className="text-center py-12 text-gray-500">
              Loading feeds...
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 