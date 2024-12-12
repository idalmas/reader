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

export default function RSSReader() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
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
            const itemsWithFeedTitle = feedContent.items.map(item => ({
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
      setError('Failed to fetch feeds');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedContent = async (url: string) => {
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

  return (
    <AppLayout>
      <div className="px-8">
        <div className="max-w-2xl">
          {allItems.map((item) => (
            <article key={item.guid} className="py-6 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>{item.feedTitle}</span>
                <span>•</span>
                <time>{new Date(item.pubDate).toLocaleDateString()}</time>
              </div>
              <h2 className="text-xl font-medium mb-1">
                <Link 
                  href={`/article/${encodeURIComponent(item.link)}`}
                  className="hover:text-gray-600 transition-colors"
                >
                  {item.title}
                </Link>
              </h2>
              {item.author && (
                <p className="text-sm text-gray-500">By {item.author}</p>
              )}
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