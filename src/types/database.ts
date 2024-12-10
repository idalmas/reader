export type ItemStatus = 'unread' | 'read' | 'archived'

export interface Feed {
  id: string
  url: string
  title: string
  user_id: string
  last_fetched_at: string
  created_at: string
}

export interface FeedItem {
  id: string
  feed_id: string
  title: string
  link: string
  description: string | null
  published_at: string | null
  status: ItemStatus
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      feeds: {
        Row: Feed
        Insert: Omit<Feed, 'id' | 'last_fetched_at' | 'created_at'>
        Update: Partial<Feed>
      }
      feed_items: {
        Row: FeedItem
        Insert: Omit<FeedItem, 'id' | 'created_at'>
        Update: Partial<FeedItem>
      }
    }
  }
} 