import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Define custom types for the RSS parser
interface MediaContent {
  $: {
    url?: string;
    type?: string;
    medium?: string;
  };
}

type CustomItem = {
  creator?: string;
  author?: string;
  content?: string;
  contentEncoded?: string;
  media?: MediaContent;
  guid: string;
};

type CustomFeed = {
  title: string;
  description?: string;
  link?: string;
};

// Create a new parser instance with custom types
const parser: Parser<CustomFeed, CustomItem> = new Parser({
  defaultRSS: 2.0,
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

export async function POST(req: Request) {
  try {
    const { feedUrl } = await req.json();

    if (!feedUrl) {
      return NextResponse.json(
        { error: 'Feed URL is required' },
        { status: 400 }
      );
    }

    // Fetch and parse the feed
    const feed = await parser.parseURL(feedUrl);

    // Transform the feed items to include only what we need
    const items = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      content: item.content || item.contentEncoded,
      pubDate: item.pubDate,
      author: item.creator || item.author,
      categories: item.categories,
      guid: item.guid,
    }));

    return NextResponse.json({
      title: feed.title,
      description: feed.description,
      link: feed.link,
      items,
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or parse RSS feed' },
      { status: 500 }
    );
  }
} 