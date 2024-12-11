import { NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch the webpage
    const response = await fetch(url);
    const html = await response.text();

    // Parse the HTML content
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return NextResponse.json(
        { error: 'Could not extract article content' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      title: article.title,
      content: article.content,
      textContent: article.textContent,
      excerpt: article.excerpt,
      byline: article.byline,
      length: article.length,
    });
  } catch (error) {
    console.error('Error extracting article:', error);
    return NextResponse.json(
      { error: 'Failed to extract article content' },
      { status: 500 }
    );
  }
} 