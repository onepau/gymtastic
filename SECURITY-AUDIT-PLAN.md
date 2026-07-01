# Gymtastic Security Audit & Remediation Plan

**Date:** 2026-07-01
**Scope:** `worker/src/index.js`, `worker/wrangler.toml`, `export-to-d1.js`, `schema.sql`, repo hygiene, dependencies.
**Method:** Manual code review of the full codebase and git history.

Findings are ordered by **priority first, then ease of implementation** — work top to bottom.

---

## Phase 1 — Critical (fix immediately)

### 1.1 Live admin token committed to the repository — CRITICAL
- **Where:** `worker/wrangler.toml:13` — `ADMIN_TOKEN = "L9EC…7s6A"`. It also appears in **3 commits of git history**, so it is exposed to anyone with repo access even if the line is deleted.
- **Impact:** Full admin access to the production site: create/overwrite any page, inject arbitrary HTML/JS served to every visitor (see 3.2).
- **Fix (effort: ~10 min):**
  1. Generate a new token and **rotate it** — the current value must be considered burned regardless of any cleanup: `openssl rand -base64 48`
  2. Store it as a Cloudflare secret instead of a plaintext var: `cd worker && npx wrangler secret put ADMIN_TOKEN`
  3. Delete the `ADMIN_TOKEN` line from `wrangler.toml` (secrets are exposed on `env` the same way, no code change needed).
  4. Optional (the rotation is the real fix): purge the value from git history with `git filter-repo` / BFG if the repo is or ever becomes shared.

### 1.2 Insecure default token fallback — CRITICAL
- **Where:** `worker/src/index.js:637` — `const ADMIN_TOKEN = env.ADMIN_TOKEN || 'change-this-token';`
- **Impact:** If the secret is ever unset (new environment, rename, typo), the admin panel silently accepts a publicly known password.
- **Fix (effort: 5 min):** Fail closed — if `env.ADMIN_TOKEN` is missing, disable all `/admin` routes:
  ```js
  if (path.startsWith('/admin') && !env.ADMIN_TOKEN) {
    return new Response('Admin disabled: ADMIN_TOKEN not configured', { status: 503 });
  }
  ```

---

## Phase 2 — High priority

### 2.1 Session cookie stores the raw admin token and lacks the `Secure` flag — HIGH
- **Where:** `worker/src/index.js:470-474` (`setSessionCookie`) and `:466-468` (`isAuthenticated`).
- **Impact:** The credential itself is sent to the browser and replayed on every admin request. `Secure` is not set, so a plaintext HTTP request (misconfiguration, downgrade) would leak the token. There is also no server-side expiry or revocation — `Max-Age` is advisory only; a stolen cookie works forever until the token is rotated.
- **Fix (effort: ~1 h):**
  - Quick win (1 line): append `; Secure` to the cookie string.
  - Proper fix: on login, issue an HMAC-signed value (`crypto.subtle`, key = ADMIN_TOKEN or a dedicated secret) of `expiry-timestamp`, e.g. `exp.signature`, and verify signature + expiry in `isAuthenticated`. The raw token then never leaves the login form, and sessions genuinely expire.

### 2.2 No security headers on any response — HIGH
- **Where:** all `new Response(...)` sites in `worker/src/index.js`.
- **Impact:** No defense-in-depth against XSS (relevant because pages render stored HTML, see 3.2), clickjacking, or MIME sniffing.
- **Fix (effort: ~30 min):** Add a helper that appends to every HTML response:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src * data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```
  Note: inline `<script>` blocks (JSON-LD, GA bootstrap) currently require `'unsafe-inline'`; tighten later with nonces or by moving GA config into the gtag.js URL. For `/admin` pages use a stricter policy (no external scripts at all).

### 2.3 Non-constant-time token comparison — HIGH (easy)
- **Where:** `worker/src/index.js:648` (`token !== ADMIN_TOKEN`) and `:467` (cookie compare).
- **Impact:** String comparison time leaks how many leading characters match, enabling a remote timing attack on the token. Practical difficulty is high, but the fix is trivial.
- **Fix (effort: 15 min):** Use `crypto.subtle.timingSafeEqual` (available in Workers) after encoding both values, with a length check first. Becomes moot for the cookie path once 2.1's signed-session fix lands.

### 2.4 No brute-force protection on `/admin/login` — HIGH
- **Where:** `worker/src/index.js:644-669`.
- **Impact:** Unlimited password guesses at edge speed.
- **Fix (effort: ~20 min, no code):** Add a Cloudflare WAF rate-limiting rule for `POST /admin/login` (e.g. 5 requests/min per IP). Optionally add Turnstile to the login form later. The long random token makes brute force impractical today, but the rule is nearly free.

---

## Phase 3 — Medium priority

### 3.1 JSON-LD injection on the homepage — MEDIUM
- **Where:** `worker/src/index.js:323-331` — `SITE_NAME`/`SITE_DESCRIPTION` are interpolated raw into a `<script type="application/ld+json">` block (unlike `getSchemaForPage`, which uses `JSON.stringify`).
- **Impact:** A quote or `</script>` in either env var breaks out of the script block → XSS. Values are operator-controlled today, so risk is latent, but it is a real sink.
- **Fix (effort: 10 min):** Build the object in JS and embed `JSON.stringify(obj).replace(/</g, '\\u003c')`, mirroring `getSchemaForPage` (apply the `<` escape there too).

### 3.2 Stored HTML rendered unsanitized (`body_html`) — MEDIUM (accepted-risk by design; mitigate)
- **Where:** `worker/src/index.js:251` — `${page.body_html || ''}`; content enters via `/admin/save` and the ContentClaw import.
- **Impact:** This is a CMS-style trusted-content model, but it means any admin-token compromise (see 1.1 — the token was already leaked) or a poisoned `import-pages.sql` becomes **persistent XSS for every visitor**.
- **Fix (effort: 1-3 h):** Primary mitigation is the CSP from 2.2 (blocks inline event handlers/scripts once tightened). Optionally sanitize on save with an allowlist sanitizer that runs on Workers (e.g. a WASM/regex-free HTML sanitizer), or at minimum strip `<script>`, `on*=` attributes and `javascript:` URLs in `/admin/save`.

### 3.3 Slug not validated; unescaped in sitemap XML and href attributes — MEDIUM
- **Where:** `/admin/save` (`index.js:720`) only lowercases and hyphenates whitespace; slug is then interpolated unescaped into the sitemap (`:436`), homepage card `href` (`:294`), and canonical link (`:205`).
- **Impact:** A slug containing `"`, `<`, or `&` corrupts or injects into XML/HTML attributes. Authenticated-admin input only, but cheap to close. `INSERT OR REPLACE` also lets a typo silently overwrite an existing page.
- **Fix (effort: 20 min):** Enforce `^[a-z0-9-]{1,200}$` in `/admin/save` (reject otherwise), and `escapeHtml()` the slug at every render sink. Consider `INSERT ... ON CONFLICT(slug) DO UPDATE` with an explicit "overwrite?" flag instead of blind REPLACE.

### 3.4 `image_url` / `HERO_IMAGE_URL` scheme not validated — MEDIUM-LOW
- **Where:** `index.js:191-193, 204, 309`.
- **Impact:** Values are attribute-escaped (good), but nothing stops a non-`https:` URL (e.g. `javascript:` — inert in `img src` on modern browsers, but leaks into `og:image` and future sinks).
- **Fix (effort: 10 min):** In `/admin/save`, parse with `new URL()` and require protocol `https:`; store `null` otherwise.

---

## Phase 4 — Low priority / hardening & hygiene

### 4.1 Tracked `.wrangler/` cache files in git — LOW (easy)
- **Where:** `worker/.wrangler/cache/wrangler-account.json` (Cloudflare account ID) and `cf.json` (developer's IP-derived geo/TLS fingerprint data) are tracked despite being gitignored (they were committed before the ignore rule).
- **Fix (effort: 5 min):** `git rm --cached -r worker/.wrangler worker/.ipynb_checkpoints worker/untitled.txt` and commit. Account IDs are not secrets per se, but none of this belongs in the repo.

### 4.2 Unbounded `analytics` table growth — LOW
- **Where:** `index.js:759-763, 784-788` — one row per hit, forever.
- **Impact:** Availability/cost: anyone can flood the table toward D1 storage limits; no read path exists in the worker anyway.
- **Fix (effort: 30 min):** Add a scheduled (cron trigger) cleanup deleting rows older than N days, and/or sample non-bot traffic. `user_agent.slice(0, 200)` is already a good cap.

### 4.3 Login/logout CSRF hardening — LOW
- **Where:** admin forms have no CSRF tokens. `SameSite=Strict` + `Path=/admin` on the session cookie already blocks classic cross-site CSRF on `/admin/save` and `/admin/logout`; login CSRF is possible but pointless (attacker would need the password).
- **Fix (effort: 1 h, optional):** Add a per-session CSRF token to admin forms once signed sessions (2.1) exist. Also verify `Origin`/`Sec-Fetch-Site` headers on admin POSTs — a 5-line check.

### 4.4 `export-to-d1.js` builds SQL by string concatenation — LOW
- **Where:** `export-to-d1.js:15-30`.
- **Impact:** Doubling single quotes is the correct escaping for SQLite string literals, so this is not currently injectable — but it is fragile, and the input is AI-generated content. A future edit (e.g. adding a numeric column without quoting) reintroduces injection into your production DB import.
- **Fix (effort: keep in mind):** Keep the escaping comment honest; prefer generating the SQL with a small allowlist check (reject NUL bytes), or import via the D1 HTTP API with bound parameters if the pipeline ever grows.

### 4.5 Dependency audit — TODO
- `npm audit` could not run in this environment (registry.npmjs.org not in the network allowlist). Run `npm audit` locally.
- `package.json` declares both `better-sqlite3` and `sqlite3`; only `better-sqlite3` is used (`export-to-d1.js:1`). Remove `sqlite3` to shrink the attack/maintenance surface.
- The worker itself has zero runtime dependencies — good.

---

## Summary checklist

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 1.1 | Admin token committed to repo & history | Critical | 10 min |
| 1.2 | `change-this-token` fallback | Critical | 5 min |
| 2.1 | Raw token in cookie, no `Secure`, no real expiry | High | 1 h |
| 2.2 | No security headers / CSP | High | 30 min |
| 2.3 | Timing-unsafe token comparison | High | 15 min |
| 2.4 | No login rate limiting | High | 20 min |
| 3.1 | JSON-LD injection (homepage) | Medium | 10 min |
| 3.2 | Unsanitized stored `body_html` | Medium | 1–3 h |
| 3.3 | Slug validation/escaping (sitemap, hrefs) | Medium | 20 min |
| 3.4 | `image_url` scheme validation | Medium-Low | 10 min |
| 4.1 | Tracked `.wrangler` cache files | Low | 5 min |
| 4.2 | Unbounded analytics table | Low | 30 min |
| 4.3 | CSRF hardening for admin forms | Low | 1 h |
| 4.4 | Hand-built SQL in export script | Low | note |
| 4.5 | Dependency audit + drop unused `sqlite3` | Low | 10 min |

**What is in good shape already:** consistent `escapeHtml()` use for titles/descriptions, parameterized D1 queries everywhere in the worker (no SQL injection), `HttpOnly`/`SameSite=Strict` on the session cookie, slug traversal guard (`..`/`<`), and capped `user_agent` storage.
