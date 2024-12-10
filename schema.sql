-- Create enum for item status
CREATE TYPE item_status AS ENUM ('unread', 'read', 'archived');

-- Create feeds table
CREATE TABLE feeds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    user_id TEXT NOT NULL,
    last_fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(url, user_id)
);

-- Create feed items table
CREATE TABLE feed_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_id UUID REFERENCES feeds(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    status item_status DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(link, feed_id)
);

-- Create indexes for better query performance
CREATE INDEX feed_items_feed_id_idx ON feed_items(feed_id);
CREATE INDEX feed_items_status_idx ON feed_items(status);
CREATE INDEX feeds_user_id_idx ON feeds(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;

-- Create policies for feeds
CREATE POLICY "Enable read access for own feeds"
    ON feeds FOR SELECT
    USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Enable insert access for own feeds"
    ON feeds FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Enable update access for own feeds"
    ON feeds FOR UPDATE
    USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Enable delete access for own feeds"
    ON feeds FOR DELETE
    USING (auth.jwt() ->> 'sub' = user_id);

-- Create policies for feed items
CREATE POLICY "Enable read access for own feed items"
    ON feed_items FOR SELECT
    USING (feed_id IN (
        SELECT id FROM feeds WHERE auth.jwt() ->> 'sub' = user_id
    ));

CREATE POLICY "Enable update access for own feed items"
    ON feed_items FOR UPDATE
    USING (feed_id IN (
        SELECT id FROM feeds WHERE auth.jwt() ->> 'sub' = user_id
    )); 