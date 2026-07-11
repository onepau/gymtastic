# Guide 3: CMS setup, settings and instructions

## 1. Architecture recap

The CMS is a set of authenticated `/admin` routes added to the existing Worker, deliberately kept as plain server-rendered HTML forms with no build step and no shared tooling with whatever the public-facing design ends up being. This keeps it simple regardless of which path Guide 1 lands on.

## 2. Routes to build

| Route | Purpose |
|---|---|
| `GET /admin` | Dashboard: counts by status/source/lang, quick links |
| `GET /admin/pages` | Filterable, paginated list of all pages |
| `GET /admin/pages/:id/edit` | Edit form for a single page (title, meta description, body, status) |
| `POST /admin/pages/:id/edit` | Save changes |
| `POST /admin/pages/:id/status` | Change status (draft/published/hidden/deleted) — one click, no full edit needed |
| `GET /admin/generate` | Form to trigger new content generation |
| `POST /admin/generate` | Dispatches to GitHub Actions (see Guide 4) |

## 3. Authentication setup

Two options — pick one.

**Option A — shared secret cookie (fastest, lowest effort)**

1. Generate a long random string, store it as a Worker secret: `npx wrangler secret put ADMIN_PASSWORD`
2. Add a `/admin/login` route with a simple password form
3. On correct password, set an HttpOnly, secure cookie with a signed token (HMAC using a second secret: `npx wrangler secret put COOKIE_SECRET`)
4. Every `/admin/*` route checks for a valid cookie before proceeding, redirecting to `/admin/login` otherwise

**Option B — Cloudflare Access (more robust, still free at your scale)**

1. In the Cloudflare dashboard, under Zero Trust → Access → Applications, add an application covering `gymtastic.cc/admin*`
2. Set a policy allowing only your email address (Access supports free one-time-PIN login for up to 50 users)
3. No code changes needed in the Worker — Cloudflare handles auth at the edge before requests reach it

Option B is worth the small setup cost — it's genuinely free at this scale and means you're not maintaining your own auth code.

## 4. The status model

Every page in D1 sits in exactly one of four states:

- **draft** — newly generated, not yet reviewed, not visible on the public site
- **published** — live and visible
- **hidden** — was published, temporarily pulled from the public site, not deleted
- **deleted** — soft-deleted, excluded from every query, effectively invisible everywhere but recoverable if needed

New content from both ContentClaw and Gymbot should land as `draft` by default, so nothing goes live without a look first — relax this once you trust the pipeline's output quality.

## 5. Settings the CMS should expose

- Filter/search by `status`, `source` (contentclaw/gymbot), `lang`, and `template` (legacy/flagship — see Guide 4)
- Bulk actions: select multiple rows, apply a status change to all of them at once (useful for retiring a whole batch of old ContentClaw pages)
- The generate form: keyword, page type, target language and which pipeline to use (ContentClaw for bulk/long-tail, Gymbot for flagship content) — this dispatches the GitHub Action from Guide 4

## 6. Day-to-day instructions

- **To retire an old page:** find it in `/admin/pages`, set status to `hidden` if you might want it back, or `deleted` if not
- **To review new content before it goes live:** filter by `status = draft`, read through, flip to `published` when happy
- **To generate a new flagship article:** go to `/admin/generate`, choose Gymbot, fill in the topic, submit — it lands as `draft` once the GitHub Action finishes
- **To generate a bulk batch:** same form, choose ContentClaw, optionally point at an uploaded seeds file
- **To translate an existing page:** from its edit view, use the "translate" button and choose a target language — creates a new `draft` row linked by slug pattern, doesn't touch the original

## 7. Security specifics for this panel

Covered in full in Guide 1's checklist — two CMS-specific items worth repeating: rate-limit `/admin/login` if using Option A, and never let `/admin/generate` accept a raw prompt that gets passed unsanitised into a shell command if you ever wire local script execution instead of GitHub Actions.

## 8. Optional: audit trail

Not required, but if you want to know who changed what and when later — relevant once anyone besides you touches this — add a simple `page_history` table logging `page_id`, `changed_field`, `old_value`, `new_value` and `changed_at` on every edit. Cheap to add now, expensive to reconstruct retroactively if you skip it and later wish you had it.
