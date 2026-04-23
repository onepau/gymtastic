# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gymtastic is an SEO-optimized gymnastics reference site built as a Cloudflare Worker with a Cloudflare D1 (SQLite) database. Content is generated via ContentClaw (AI-powered content tool) and migrated to D1 for production.

## Development Commands

### Worker (Cloudflare)
```bash
cd worker
npx wrangler dev          # Run worker locally
npx wrangler deploy       # Deploy to Cloudflare
```

### Database
```bash
# Apply schema to local D1
npx wrangler d1 execute gymtastic-db --local --file=../schema.sql

# Apply schema to remote D1
npx wrangler d1 execute gymtastic-db --file=../schema.sql

# Import content pages to D1
npx wrangler d1 execute gymtastic-db --file=../import-pages.sql

# Export ContentClaw local DB to SQL for D1 import
node export-to-d1.js   # (run from root, outputs import-pages.sql)
```

### ContentClaw (Content Generation)
ContentClaw runs as a local server on `localhost:3099`. Config is in `contentclaw.config.json`. Generated content lives in `contentclaw.db` locally and must be exported to D1 using `export-to-d1.js`.

## Architecture

### Request Flow
1. Cloudflare Worker (`worker/src/index.js`) handles all HTTP requests at the edge
2. Routes: `/` (homepage), `/{slug}` (content pages), `/sitemap.xml`, `/robots.txt`, `/admin` (token-protected), `/admin/save`
3. Pages are fetched from D1 and rendered to HTML dynamically — no templates, just string concatenation in JS

### Database (D1 / SQLite)
- **`pages`** table: `slug`, `title`, `meta_description`, `body_html`, `page_type`, `keyword`, `created_at`, `updated_at`
- **`analytics`** table: `page_slug`, `user_agent`, `country`, `is_bot`, `visited_at`
- D1 binding name in wrangler: `DB`

### Page Types
Eight supported types (used for schema.org structured data selection): `article`, `hub`, `howto`, `glossary`, `comparison`, `list`, `review`, `landing`

### Content Pipeline
1. ContentClaw generates content → stored in local `contentclaw.db`
2. `export-to-d1.js` reads `contentclaw.db` and writes `import-pages.sql`
3. `import-pages.sql` is executed against Cloudflare D1 (local or remote)
4. Alternatively, pages can be created manually via the `/admin` panel (protected by `ADMIN_TOKEN` env var)

### SEO / Structured Data
The worker generates JSON-LD schema.org markup per page type, Open Graph tags, canonical URLs, and a `/sitemap.xml` from all pages in D1. Bot detection identifies major crawlers (GoogleBot, GPTBot, ClaudeBot, etc.) and tracks them separately in analytics.

## Key Config Files
- `worker/wrangler.toml` — Cloudflare Worker name, D1 binding, environment variables (`SITE_NAME`, `SITE_DESCRIPTION`, `ADMIN_TOKEN`)
- `contentclaw.config.json` — AI content generation settings (brand, tone, word count, OpenAI model)
- `schema.sql` — Canonical DB schema (source of truth for table structure)
