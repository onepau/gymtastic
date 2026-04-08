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
`;

function renderPage(page, siteName, siteDesc) {
  const schemaBlock = `<script type="application/ld+json">${getSchemaForPage(page, 'gymtastic.cc')}</script>`;
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
  <link rel="canonical" href="/${page.slug}">
  ${schemaBlock}
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
  </style>
</head>
<body>
  <header>
    <a href="/"><span>Gym</span>tastic</a>
  </header>
  <nav class="breadcrumb">
    <a href="/">Home</a> &rsaquo; <span>${escapeHtml(page.title)}</span>
  </nav>
  <main>
    <p class="meta">${escapeHtml(page.page_type || '')}</p>
    <h1>${escapeHtml(page.title)}</h1>
    ${page.body_html || ''}
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(siteName)}</p>
  </footer>
</body>
</html>`;
}

function renderHomepage(pages, siteName, siteDesc) {
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(siteDesc)}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "${siteName}",
    "url": "https://gymtastic.cc",
    "description": "${siteDesc}"
  }
  </script>
  <style>
    ${SHARED_STYLES}

    body { max-width: 1040px; }

    .site-desc { color: var(--muted); margin: -1.5rem 0 2.5rem; font-size: 1rem; }

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
  <p class="site-desc">${escapeHtml(siteDesc)}</p>
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const userAgent = request.headers.get('user-agent') || '';
    const country = request.headers.get('cf-ipcountry') || 'XX';
    const bot = isBot(userAgent) ? 1 : 0;
    const ADMIN_TOKEN = env.ADMIN_TOKEN || 'change-this-token';

    // Admin form
    if (path === '/admin') {
      const token = url.searchParams.get('token');
      if (token !== ADMIN_TOKEN) {
        return new Response('Unauthorised', { status: 401 });
      }
      return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Add page — Admin</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; }
    label { display: block; font-weight: 600; margin: 1rem 0 0.25rem; }
    input, textarea, select { width: 100%; padding: 0.5rem; border: 1px solid #ccc;
                              border-radius: 4px; font-size: 0.95rem; font-family: inherit; }
    textarea { height: 300px; font-family: monospace; }
    button { margin-top: 1.5rem; padding: 0.75rem 2rem; background: #e8272b;
             color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #c51f23; }
  </style>
</head>
<body>
  <h1>Add a new page</h1>
  <form method="POST" action="/admin/save?token=${ADMIN_TOKEN}">
    <label for="slug">Slug (URL path, e.g. gymnastics-scoring-guide)</label>
    <input type="text" id="slug" name="slug" required placeholder="gymnastics-scoring-guide">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" required>
    <label for="meta_description">Meta description</label>
    <input type="text" id="meta_description" name="meta_description">
    <label for="keyword">Keyword</label>
    <input type="text" id="keyword" name="keyword">
    <label for="page_type">Page type</label>
    <select id="page_type" name="page_type">
      <option value="blog">Article</option>
      <option value="hub">Hub / Topic guide</option>
      <option value="how-to">How-to guide</option>
      <option value="glossary">Glossary</option>
      <option value="comparison">Comparison</option>
      <option value="listicle">List</option>
      <option value="review">Review</option>
      <option value="landing">Landing page</option>
    </select>
    <label for="body_html">Content (HTML)</label>
    <textarea id="body_html" name="body_html" required placeholder="<p>Your content here...</p>"></textarea>
    <button type="submit">Save page</button>
  </form>
</body>
</html>`, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    }

    // Admin save
    if (path === '/admin/save' && request.method === 'POST') {
      const token = url.searchParams.get('token');
      if (token !== ADMIN_TOKEN) {
        return new Response('Unauthorised', { status: 401 });
      }
      const formData = await request.formData();
      const slug = formData.get('slug')?.trim().toLowerCase().replace(/\s+/g, '-');
      const title = formData.get('title')?.trim();
      const meta_description = formData.get('meta_description')?.trim();
      const keyword = formData.get('keyword')?.trim();
      const page_type = formData.get('page_type')?.trim();
      const body_html = formData.get('body_html')?.trim();
      if (!slug || !title || !body_html) {
        return new Response('Missing required fields', { status: 400 });
      }
      await env.DB.prepare(
        'INSERT OR REPLACE INTO pages (slug, title, meta_description, keyword, page_type, body_html) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(slug, title, meta_description, keyword, page_type, body_html).run();
      return Response.redirect(`https://gymtastic.cc/${slug}`, 302);
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
        renderHomepage(results, env.SITE_NAME, env.SITE_DESCRIPTION),
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
      renderPage(page, env.SITE_NAME, env.SITE_DESCRIPTION),
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