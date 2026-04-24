const BOT_PATTERNS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'Googlebot', 'GoogleOther',
  'bingbot', 'AhrefsBot', 'SemrushBot', 'DotBot', 'PerplexityBot',
  'ClaudeBot', 'anthropic-ai', 'facebookexternalhit', 'Twitterbot'
];

function isBot(userAgent) {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern =>
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}

function getSchemaForPage(page, host) {
  const base = {
    "@context": "https://schema.org",
    "@graph": []
  };
  base["@graph"].push({
    "@type": "Article",
    "headline": page.title,
    "description": page.meta_description,
    "url": `https://${host}/${page.slug}`,
    "publisher": {
      "@type": "Organization",
      "name": "Gymtastic",
      "url": `https://${host}`
    }
  });
  if (page.page_type === 'glossary') {
    base["@graph"].push({
      "@type": "DefinedTerm",
      "name": page.title,
      "description": page.meta_description
    });
  }
  if (page.page_type === 'how-to') {
    base["@graph"].push({
      "@type": "HowTo",
      "name": page.title,
      "description": page.meta_description
    });
  }
  return JSON.stringify(base);
}

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600&family=Barlow+Condensed:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --accent:  #e8272b;
    --text:    #1a1a1a;
    --muted:   #6b7280;
    --border:  #e5e7eb;
    --bg-soft: #f8f8f6;
  }

  body {
    font-family: 'Barlow', system-ui, sans-serif;
    font-size: 1.0625rem;
    line-height: 1.75;
    color: var(--text);
    margin: 0 auto;
    padding: 2rem 1.5rem;
    background: #fff;
  }

  header {
    display: flex;
    align-items: center;
    border-bottom: 3px solid var(--accent);
    padding-bottom: 1rem;
    margin-bottom: 2.5rem;
  }

  header a {
    text-decoration: none;
    color: var(--text);
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 1.6rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  header a span { color: var(--accent); }

  h1, h2, h3 {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.01em;
  }

  p { margin: 0 0 1.4rem; }

  a { color: var(--accent); text-decoration-color: transparent; transition: text-decoration-color 0.15s; }
  a:hover { text-decoration-color: var(--accent); }

  table { border-collapse: collapse; width: 100%; margin: 1.75rem 0; font-size: 0.95rem; }
  th, td { border: 1px solid var(--border); padding: 0.65rem 1rem; text-align: left; }
  th { background: var(--bg-soft); font-weight: 700; font-size: 0.8rem;
       text-transform: uppercase; letter-spacing: 0.05em; }
  tr:nth-child(even) td { background: var(--bg-soft); }

  code { background: var(--bg-soft); padding: 0.15rem 0.45rem;
         border-radius: 4px; font-size: 0.875em; border: 1px solid var(--border); }

  footer {
    border-top: 1px solid var(--border);
    margin-top: 4rem;
    padding-top: 1.5rem;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .ticker-outer {
    display: flex;
    align-items: stretch;
    background: var(--accent);
    color: #fff;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    margin: -2.5rem -1.5rem 2.5rem;
  }

  .ticker-label {
    flex-shrink: 0;
    background: #c51f23;
    padding: 0.45rem 0.85rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
  }

  .ticker-wrap {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    padding: 0.45rem 0;
  }

  .ticker-track {
    display: inline-block;
    animation: ticker-scroll 40s linear infinite;
  }

  .ticker-wrap:hover .ticker-track { animation-play-state: paused; }

  .ticker-item { display: inline-block; padding: 0 2.5rem; }
  .ticker-item::before { content: '\\25B8'; margin-right: 0.5rem; opacity: 0.75; }

  @keyframes ticker-scroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

const TICKER_ITEMS = [
  'Paris 2024 — Simone Biles wins gold on floor exercise and beam',
  'World Championships — USA gymnastics team takes all-around title',
  'Difficulty vs. execution: how the Code of Points scoring works',
  'Artistic gymnastics has 6 apparatuses for men and 4 for women',
  'The Yurchenko double pike — most difficult vault in history',
  'Rhythmic gymnastics combines dance, acrobatics, and apparatus skills',
  'Trampoline gymnastics debuted at the Sydney 2000 Olympics',
  'The perfect 10 era ended in 2006 when the open-ended scoring system launched',
];

function renderTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  const items = doubled.map(t => `<span class="ticker-item">${escapeHtml(t)}</span>`).join('');
  return `<div class="ticker-outer"><span class="ticker-label">News</span><div class="ticker-wrap"><span class="ticker-track">${items}</span></div></div>`;
}

function gaSnippet(gaId) {
  if (!gaId) return '';
  return `
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(gaId)}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${escapeHtml(gaId)}');
  </script>`;
}

function renderPage(page, siteName, siteDesc, gaId) {
  const schemaBlock = `<script type="application/ld+json">${getSchemaForPage(page, 'gymtastic.cc')}</script>`;
  const featuredImage = page.image_url
    ? `<img class="featured-image" src="${escapeHtml(page.image_url)}" alt="${escapeHtml(page.title)}" loading="lazy">`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title)} | ${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(page.meta_description || '')}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.meta_description || '')}">
  <meta property="og:type" content="article">
  ${page.image_url ? `<meta property="og:image" content="${escapeHtml(page.image_url)}">` : ''}
  <link rel="canonical" href="/${page.slug}">
  ${schemaBlock}
  ${gaSnippet(gaId)}
  <style>
    ${SHARED_STYLES}

    body { max-width: 860px; }

    h1 { font-size: 2.6rem; margin: 0 0 1rem; }
    h2 { font-size: 1.75rem; margin-top: 2.75rem; padding-top: 2.75rem; border-top: 1px solid var(--border); }
    h3 { font-size: 1.3rem; margin-top: 2rem; }

    .breadcrumb { font-size: 0.82rem; color: var(--muted); margin-bottom: 1.75rem; }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--accent); }

    .meta {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--muted);
      margin-bottom: 1.5rem;
    }

    .featured-image {
      width: 100%;
      max-height: 420px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
  </style>
</head>
<body>
  <header>
    <a href="/"><span>Gym</span>tastic</a>
  </header>
  ${renderTicker()}
  <nav class="breadcrumb">
    <a href="/">Home</a> &rsaquo; <span>${escapeHtml(page.title)}</span>
  </nav>
  <main>
    <p class="meta">${escapeHtml(page.page_type || '')}</p>
    <h1>${escapeHtml(page.title)}</h1>
    ${featuredImage}
    ${page.body_html || ''}
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(siteName)}</p>
  </footer>
</body>
</html>`;
}

function renderHomepage(pages, siteName, siteDesc, gaId, heroImageUrl, heroText, gscVerification) {
  const typeLabels = {
    'blog':         'Articles',
    'glossary':     'Glossary',
    'how-to':       'How-to guides',
    'comparison':   'Comparisons',
    'listicle':     'Lists',
    'review':       'Reviews',
    'alternatives': 'Alternatives',
    'landing':      'Topics',
    'hub':          'Topic guides',
    'auto':         'General'
  };

  const groups = {};
  for (const page of pages) {
    const type = page.page_type || 'general';
    if (!groups[type]) groups[type] = [];
    groups[type].push(page);
  }

  const order = ['hub', 'how-to', 'blog', 'glossary', 'comparison', 'listicle', 'review', 'alternatives', 'landing', 'auto', 'general'];
  const sortedTypes = Object.keys(groups).sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const groupsHtml = sortedTypes.map(type => {
    const label = typeLabels[type] || type;
    const cards = groups[type].map(p =>
      `<a class="card" href="/${p.slug}">${escapeHtml(p.title)}</a>`
    ).join('\n');
    return `
    <section>
      <p class="section-label">${escapeHtml(label)}</p>
      <div class="card-grid">${cards}</div>
    </section>`;
  }).join('\n');

  const heroSection = heroImageUrl ? `
  <div class="hero">
    <div class="hero-text">
      <h1 class="hero-heading">${escapeHtml(siteName)}</h1>
      <p class="hero-desc">${escapeHtml(heroText || siteDesc)}</p>
    </div>
    <img class="hero-image" src="${escapeHtml(heroImageUrl)}" alt="${escapeHtml(siteName)}" loading="eager">
  </div>` : `<p class="site-desc">${escapeHtml(siteDesc)}</p>`;

  const gscMeta = gscVerification
    ? `\n  <meta name="google-site-verification" content="${escapeHtml(gscVerification)}">`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(siteDesc)}">${gscMeta}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "${siteName}",
    "url": "https://gymtastic.cc",
    "description": "${siteDesc}"
  }
  </script>
  ${gaSnippet(gaId)}
  <style>
    ${SHARED_STYLES}

    body { max-width: 1040px; }

    .site-desc { color: var(--muted); margin: -1.5rem 0 2.5rem; font-size: 1rem; }

    .hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      align-items: center;
      background: var(--bg-soft);
      border-radius: 12px;
      padding: 2.5rem;
      margin-bottom: 3rem;
    }

    @media (max-width: 640px) {
      .hero { grid-template-columns: 1fr; }
      .hero-image { order: -1; }
    }

    .hero-heading {
      font-size: 2.8rem;
      margin: 0 0 1rem;
      line-height: 1.1;
    }

    .hero-heading span { color: var(--accent); }

    .hero-desc {
      color: var(--muted);
      font-size: 1.05rem;
      margin: 0;
      line-height: 1.7;
    }

    .hero-image {
      width: 100%;
      border-radius: 8px;
      object-fit: cover;
      max-height: 320px;
    }

    .section-label {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent);
      border-left: 3px solid var(--accent);
      padding-left: 0.6rem;
      margin: 3rem 0 0.75rem;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .card {
      display: block;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      text-decoration: none;
      color: var(--text);
      font-size: 0.92rem;
      font-weight: 600;
      line-height: 1.4;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .card:hover {
      border-color: var(--accent);
      box-shadow: 0 3px 12px rgba(0,0,0,0.07);
      color: var(--accent);
      text-decoration-color: transparent;
    }
  </style>
</head>
<body>
  <header>
    <a href="/"><span>Gym</span>tastic</a>
  </header>
  ${renderTicker()}
  ${heroSection}
  <main>
    ${groupsHtml}
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(siteName)}</p>
  </footer>
</body>
</html>`;
}

function renderSitemap(pages, host) {
  const urls = pages.map(p =>
    `<url><loc>https://${host}/${p.slug}</loc><changefreq>monthly</changefreq></url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://${host}/</loc><changefreq>weekly</changefreq></url>
  ${urls}
</urlset>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const ADMIN_COOKIE = 'admin_session';

function getAdminCookie(request) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === ADMIN_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function isAuthenticated(request, adminToken) {
  return getAdminCookie(request) === adminToken;
}

function setSessionCookie(token, clear = false) {
  const value = clear ? '' : encodeURIComponent(token);
  const maxAge = clear ? 0 : 60 * 60 * 8; // 8 hours
  return `${ADMIN_COOKIE}=${value}; HttpOnly; Path=/admin; SameSite=Strict; Max-Age=${maxAge}`;
}

function redirect(location) {
  return new Response(null, { status: 302, headers: { Location: location } });
}

function adminStyles() {
  return `
    body { font-family: -apple-system, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1.5rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #6b7280; margin-bottom: 2rem; font-size: 0.9rem; }
    .nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
    .nav h1 { margin: 0; }
    label { display: block; font-weight: 600; margin: 1rem 0 0.25rem; }
    input, textarea, select { width: 100%; padding: 0.5rem; border: 1px solid #ccc;
                              border-radius: 4px; font-size: 0.95rem; font-family: inherit; }
    textarea { height: 300px; font-family: monospace; }
    .btn { display: inline-block; margin-top: 1.5rem; padding: 0.65rem 1.75rem; background: #e8272b;
           color: white; border: none; border-radius: 4px; font-size: 0.95rem; cursor: pointer;
           text-decoration: none; }
    .btn:hover { background: #c51f23; }
    .btn-secondary { background: #374151; margin-left: 0.75rem; }
    .btn-secondary:hover { background: #1f2937; }
    .btn-ghost { background: transparent; color: #6b7280; border: 1px solid #d1d5db; margin-left: 0.75rem; }
    .btn-ghost:hover { background: #f3f4f6; color: #374151; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem; }
    th, td { border: 1px solid #e5e7eb; padding: 0.55rem 0.85rem; text-align: left; }
    th { background: #f9fafb; font-weight: 700; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }
    tr:hover td { background: #fef2f2; }
    .tag { display: inline-block; padding: 0.15rem 0.5rem; background: #fee2e2; color: #b91c1c;
           border-radius: 3px; font-size: 0.75rem; font-weight: 600; }
    .hint { font-size: 0.8rem; color: #6b7280; margin: 0.2rem 0 0; }
    .error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
             padding: 0.65rem 1rem; border-radius: 4px; margin-bottom: 1.25rem; font-size: 0.9rem; }
  `;
}

function renderAdminLogin(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin login</title>
  <style>
    ${adminStyles()}
    body { max-width: 400px; }
    .login-box { margin-top: 4rem; }
    .logo { font-size: 1.1rem; font-weight: 700; color: #e8272b; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="login-box">
    <p class="logo">Gymtastic Admin</p>
    <h1>Sign in</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form method="POST" action="/admin/login">
      <label for="token">Admin password</label>
      <input type="password" id="token" name="token" required autofocus placeholder="Enter admin password">
      <button class="btn" type="submit" style="width:100%;text-align:center;">Sign in</button>
    </form>
  </div>
</body>
</html>`;
}

function renderAdminPageList(pages) {
  const rows = pages.map(p => `
    <tr>
      <td><a href="/admin/edit?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></td>
      <td><code>/${escapeHtml(p.slug)}</code></td>
      <td><span class="tag">${escapeHtml(p.page_type || '')}</span></td>
      <td><a href="/admin/edit?slug=${encodeURIComponent(p.slug)}">Edit</a></td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Pages</title>
  <style>${adminStyles()}</style>
</head>
<body>
  <div class="nav">
    <h1>Pages <span style="font-size:0.85rem;font-weight:400;color:#6b7280">(${pages.length})</span></h1>
    <form method="POST" action="/admin/logout" style="margin:0">
      <button class="btn btn-ghost" style="margin:0;padding:0.4rem 1rem;font-size:0.85rem" type="submit">Sign out</button>
    </form>
  </div>
  <a class="btn" style="margin-top:0" href="/admin/new">+ Add new page</a>
  <table>
    <thead>
      <tr><th>Title</th><th>Slug</th><th>Type</th><th></th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function renderAdminForm(page) {
  const isEdit = !!page;
  const val = (f) => page ? escapeHtml(page[f] || '') : '';
  const pageTypes = ['blog', 'hub', 'how-to', 'glossary', 'comparison', 'listicle', 'review', 'landing'];
  const typeOptions = pageTypes.map(t => {
    const selected = isEdit && page.page_type === t ? ' selected' : '';
    const labels = { blog: 'Article', hub: 'Hub / Topic guide', 'how-to': 'How-to guide',
      glossary: 'Glossary', comparison: 'Comparison', listicle: 'List', review: 'Review', landing: 'Landing page' };
    return `<option value="${t}"${selected}>${labels[t] || t}</option>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEdit ? 'Edit' : 'Add'} page — Admin</title>
  <style>${adminStyles()}</style>
</head>
<body>
  <h1>${isEdit ? 'Edit page' : 'Add a new page'}</h1>
  <p class="subtitle"><a href="/admin">&larr; Back to all pages</a></p>
  <form method="POST" action="/admin/save">
    <label for="slug">Slug (URL path)</label>
    <input type="text" id="slug" name="slug" required value="${val('slug')}"
      placeholder="gymnastics-scoring-guide" ${isEdit ? 'readonly style="background:#f3f4f6;color:#6b7280"' : ''}>
    ${isEdit ? '<p class="hint">Slug cannot be changed after creation.</p>' : ''}

    <label for="title">Title</label>
    <input type="text" id="title" name="title" required value="${val('title')}">

    <label for="meta_description">Meta description</label>
    <input type="text" id="meta_description" name="meta_description" value="${val('meta_description')}">

    <label for="keyword">Keyword</label>
    <input type="text" id="keyword" name="keyword" value="${val('keyword')}">

    <label for="image_url">Featured image URL</label>
    <input type="url" id="image_url" name="image_url" value="${val('image_url')}"
      placeholder="https://example.com/image.jpg">
    <p class="hint">Link to an image hosted externally (e.g. Cloudflare R2, Unsplash, Imgur).</p>

    <label for="page_type">Page type</label>
    <select id="page_type" name="page_type">${typeOptions}</select>

    <label for="body_html">Content (HTML)</label>
    <textarea id="body_html" name="body_html" required placeholder="<p>Your content here...</p>">${val('body_html')}</textarea>

    <button class="btn" type="submit">${isEdit ? 'Save changes' : 'Save page'}</button>
    <a class="btn btn-secondary" href="/admin">Cancel</a>
  </form>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const userAgent = request.headers.get('user-agent') || '';
    const country = request.headers.get('cf-ipcountry') || 'XX';
    const bot = isBot(userAgent) ? 1 : 0;
    const ADMIN_TOKEN = env.ADMIN_TOKEN || 'change-this-token';
    const GA_ID = env.GA_MEASUREMENT_ID || '';
    const GSC_VERIFICATION = env.GSC_VERIFICATION || '';
    const HERO_IMAGE_URL = env.HERO_IMAGE_URL || '';
    const HERO_TEXT = env.HERO_TEXT || '';

    // Admin — login page
    if (path === '/admin/login') {
      if (request.method === 'POST') {
        const formData = await request.formData();
        const token = formData.get('token')?.trim();
        if (token !== ADMIN_TOKEN) {
          return new Response(renderAdminLogin('Incorrect password. Please try again.'), {
            status: 401,
            headers: { 'Content-Type': 'text/html; charset=UTF-8' }
          });
        }
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/admin',
            'Set-Cookie': setSessionCookie(ADMIN_TOKEN)
          }
        });
      }
      // Already logged in → redirect
      if (isAuthenticated(request, ADMIN_TOKEN)) {
        return redirect('/admin');
      }
      return new Response(renderAdminLogin(), {
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    }

    // Admin — logout
    if (path === '/admin/logout' && request.method === 'POST') {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/admin/login',
          'Set-Cookie': setSessionCookie('', true)
        }
      });
    }

    // Guard: all remaining /admin routes require session cookie
    if (path.startsWith('/admin')) {
      if (!isAuthenticated(request, ADMIN_TOKEN)) {
        return redirect('/admin/login');
      }
    }

    // Admin — page list
    if (path === '/admin') {
      const { results } = await env.DB.prepare(
        'SELECT slug, title, page_type FROM pages ORDER BY page_type, title LIMIT 1000'
      ).all();
      return new Response(renderAdminPageList(results), {
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    }

    // Admin — new page form
    if (path === '/admin/new') {
      return new Response(renderAdminForm(null), {
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    }

    // Admin — edit existing page
    if (path === '/admin/edit') {
      const slug = url.searchParams.get('slug');
      if (!slug) return redirect('/admin');
      const page = await env.DB.prepare('SELECT * FROM pages WHERE slug = ?').bind(slug).first();
      if (!page) return new Response('Page not found', { status: 404 });
      return new Response(renderAdminForm(page), {
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    }

    // Admin save (handles both create and update via INSERT OR REPLACE)
    if (path === '/admin/save' && request.method === 'POST') {
      const formData = await request.formData();
      const slug = formData.get('slug')?.trim().toLowerCase().replace(/\s+/g, '-');
      const title = formData.get('title')?.trim();
      const meta_description = formData.get('meta_description')?.trim();
      const keyword = formData.get('keyword')?.trim();
      const page_type = formData.get('page_type')?.trim();
      const body_html = formData.get('body_html')?.trim();
      const image_url = formData.get('image_url')?.trim() || null;
      if (!slug || !title || !body_html) {
        return new Response('Missing required fields', { status: 400 });
      }
      await env.DB.prepare(
        'INSERT OR REPLACE INTO pages (slug, title, meta_description, keyword, page_type, body_html, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(slug, title, meta_description, keyword, page_type, body_html, image_url).run();
      return redirect(`/${slug}`);
    }

    // Sitemap
    if (path === '/sitemap.xml') {
      const { results } = await env.DB.prepare(
        'SELECT slug FROM pages ORDER BY id LIMIT 50000'
      ).all();
      return new Response(renderSitemap(results, url.host), {
        headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }
      });
    }

    // robots.txt
    if (path === '/robots.txt') {
      return new Response(
        `User-agent: *\nAllow: /\nSitemap: https://${url.host}/sitemap.xml\n`,
        { headers: { 'Content-Type': 'text/plain' } }
      );
    }

    // Homepage
    if (path === '/' || path === '') {
      const { results } = await env.DB.prepare(
        'SELECT slug, title, page_type FROM pages ORDER BY page_type, title LIMIT 500'
      ).all();
      ctx.waitUntil(
        env.DB.prepare(
          'INSERT INTO analytics (page_slug, user_agent, country, is_bot) VALUES (?, ?, ?, ?)'
        ).bind('/', userAgent.slice(0, 200), country, bot).run()
      );
      return new Response(
        renderHomepage(results, env.SITE_NAME, env.SITE_DESCRIPTION, GA_ID, HERO_IMAGE_URL, HERO_TEXT, GSC_VERIFICATION),
        { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=300' } }
      );
    }

    // Individual pages
    const slug = path.slice(1).replace(/\/$/, '');
    if (!slug || slug.includes('..') || slug.includes('<')) {
      return new Response('Not found', { status: 404 });
    }
    const page = await env.DB.prepare(
      'SELECT * FROM pages WHERE slug = ?'
    ).bind(slug).first();
    if (!page) {
      return new Response('Page not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    ctx.waitUntil(
      env.DB.prepare(
        'INSERT INTO analytics (page_slug, user_agent, country, is_bot) VALUES (?, ?, ?, ?)'
      ).bind(slug, userAgent.slice(0, 200), country, bot).run()
    );
    return new Response(
      renderPage(page, env.SITE_NAME, env.SITE_DESCRIPTION, GA_ID),
      {
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Robots-Tag': 'index, follow'
        }
      }
    );
  }
};
