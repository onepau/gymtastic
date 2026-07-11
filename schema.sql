CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  body_html TEXT,
  page_type TEXT,
  keyword TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  source TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  template TEXT NOT NULL DEFAULT 'legacy',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_slug TEXT,
  user_agent TEXT,
  country TEXT,
  is_bot INTEGER DEFAULT 0,
  visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_analytics_slug ON analytics(page_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_bot ON analytics(is_bot);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  dates TEXT NOT NULL,
  disciplines TEXT NOT NULL,
  year INTEGER NOT NULL,
  change_flag INTEGER DEFAULT 0,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);

-- Backfill existing pages (run once after migration):
-- UPDATE pages SET source='contentclaw', status='published', lang='en', template='legacy' WHERE source IS NULL;
