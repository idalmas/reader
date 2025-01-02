'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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

const ARTICLE_CACHE_PREFIX = 'article_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<ExtractedArticle | null>(null)
  const [loading, setLoading] = useState(true)

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

        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
  }, [params.url])

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