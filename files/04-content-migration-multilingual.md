# Guide 4: ContentClaw migration and multilingual generation at scale

## 1. Backfill the existing content

Before anything else, make sure every existing row has sensible values for the new columns:

```bash
npx wrangler d1 execute <your-db-name> --remote --command "UPDATE pages SET source = 'contentclaw', status = 'published', lang = 'en', template = 'legacy' WHERE source IS NULL;"
```

This makes every page you already have visible in the CMS as filterable, taggable content instead of an undifferentiated blob.

## 2. Audit and triage

1. In the CMS, filter by `source = contentclaw`
2. Go through page by page, or by `page_type` in bulk, and decide: keep as-is, hide, or delete
3. A reasonable default: keep everything that's indexed and getting any search traffic, hide or delete thin or duplicate pages that a competitor-sitemap-gap analysis (already on your roadmap) flags as low value

## 3. The two-tier design pattern

Rather than forcing every long-tail page through the new, heavier flagship design, split rendering by the `template` column:

- **`flagship`** — the new design, reserved for curated, high-value content: specific events, athlete profiles, anything Gymbot produces
- **`legacy`** — the current card-grid template, used for bulk ContentClaw content and the multilingual expansion below

This keeps render complexity (and, if Path B from Guide 1 applies, build time) down for pages that don't need the polish, while your flagship content gets the full treatment. The Worker's render function branches on `template` before choosing a layout — same D1 row, same URL structure, different presentation.

## 4. Important: "hidden from the main design" doesn't mean hidden from crawlers

Worth being explicit about this before building it: it's fine, and normal, for bulk/multilingual pages to be reachable only via sitemap and internal links rather than the main navigation — that's an information-architecture choice. It is **not** fine to serve different content to bots than to human visitors (cloaking), which risks a manual action from Google regardless of intent. Every page, whichever template it uses, must return the same HTML to everyone. "Hidden" should only ever mean "not linked prominently," never "different content for crawlers."

## 5. Sitemap strategy for the legacy tier

1. Generate separate sitemap files per concern, e.g. `sitemap-en.xml`, `sitemap-fr.xml`, `sitemap-bulk.xml`
2. Reference all of them from a `sitemap-index.xml` at the root
3. Submit the index to Google Search Console and Bing Webmaster Tools
4. Regenerate sitemaps as part of the same GitHub Action that publishes new content (step 7 below), not as a manual afterthought

## 6. hreflang for multilingual pages

On every translated page, add alternate links for every language version plus `x-default`:

```html
<link rel="alternate" hreflang="en" href="https://gymtastic.cc/slug" />
<link rel="alternate" hreflang="fr" href="https://gymtastic.cc/fr/slug" />
<link rel="alternate" hreflang="x-default" href="https://gymtastic.cc/slug" />
```

Route matching: `/fr/slug`, `/es/slug` and so on, falling back to the English row if a translation doesn't exist yet rather than returning a 404.

## 7. The generation pipeline at scale

1. Extend `seeds.csv` with a `lang` column, or run the same seed list once per target language
2. For ContentClaw content, generate natively in the target language if the tool supports it; otherwise generate in English first, then translate
3. For translation specifically, use a cheap, fast model — Claude Haiku is the right tool here, not Gymbot's heavier pipeline. A simple translate-and-localise prompt per page is enough; this doesn't need multi-agent orchestration
4. Wire this as a GitHub Actions workflow (`workflow_dispatch`, triggered from the CMS per Guide 3) that generates or translates, writes to D1 as `status = draft` / `template = legacy`, then regenerates sitemaps
5. New translated content lands as `draft`, same as everything else — spot-check a sample before bulk-flipping to `published`, rather than trusting translation quality blindly at volume

## 8. Cost reality check

This is the one part of the whole plan with a real, scaling cost — everything else so far has been zero-cost infrastructure. Rough guide: log token usage (per Guide 2, step 8) on a handful of translation runs, multiply by your target page count and language count, and look at the number before committing to, say, five languages across your whole catalogue at once. Start with one additional language, measure actual spend for a week, then decide whether to expand — much easier to scale up a working budget than to walk back an expensive mistake.
