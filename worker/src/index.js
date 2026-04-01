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
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           line-height: 1.7; color: #1a1a1a; max-width: 820px; margin: 0 auto;
           padding: 2rem 1.5rem; background: #fff; }
    header { border-bottom: 1px solid #e5e5e5; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    header a { text-decoration: none; color: #1a1a1a; font-weight: 700; font-size: 1.1rem; }
    h1 { font-size: 2rem; line-height: 1.3; font-weight: 800; margin: 0 0 1rem; }
    h2 { font-size: 1.4rem; margin-top: 2.5rem; }
    h3 { font-size: 1.15rem; margin-top: 2rem; }
    p { margin: 0 0 1.2rem; }
    a { color: #2563eb; }
    table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; }
    th, td { border: 1px solid #e5e5e5; padding: 0.6rem 1rem; text-align: left; }
    th { background: #f9f9f9; font-weight: 600; }
    code { background: #f4f4f4; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
    footer { border-top: 1px solid #e5e5e5; margin-top: 4rem; padding-top: 1.5rem;
             color: #666; font-size: 0.9rem; }
    .breadcrumb { font-size: 0.85rem; color: #666; margin-bottom: 1.5rem; }
    .breadcrumb a { color: #666; }
  </style>
</head>
<body>
  <header>
    <a href="/">${escapeHtml(siteName)}</a>
  </header>
  <nav class="breadcrumb">
    <a href="/">Home</a> › <span>${escapeHtml(page.title)}</span>
  </nav>
  <main>
    <h1>${escapeHtml(page.title)}</h1>
    ${page.body_html || ''}
  </main>
  <footer>
    <p>© ${new Date().getFullYear()} ${escapeHtml(siteName)}</p>
  </footer>
</body>
</html>`;
}

function renderHomepage(pages, siteName, siteDesc) {
  const typeLabels = {
    'blog': 'Articles',
    'glossary': 'Glossary',
    'how-to': 'How-to Guides',
    'comparison': 'Comparisons',
    'listicle': 'Lists',
    'review': 'Reviews',
    'alternatives': 'Alternatives',
    'landing': 'Topics',
    'hub': 'Topic Guides',
    'auto': 'General'
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
    const links = groups[type].map(p =>
      `<li><a href="/${p.slug}">${escapeHtml(p.title)}</a></li>`
    ).join('\n');
    return `
    <section class="group">
      <h2>${escapeHtml(label)}</h2>
      <ul>${links}</ul>
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
    "url": "https://${siteName}",
    "description": "${siteDesc}"
  }
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           line-height: 1.7; color: #1a1a1a; max-width: 960px; margin: 0 auto;
           padding: 2rem 1.5rem; background: #fff; }
    header { border-bottom: 1px solid #e5e5e5; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    header h1 { margin: 0 0 0.25rem; font-size: 1.8rem; font-weight: 800; }
    header p { margin: 0; color: #555; }
    .group { margin-bottom: 3rem; }
    .group h2 { font-size: 1.2rem; font-weight: 700; text-transform: uppercase;
                letter-spacing: 0.05em; color: #555; border-bottom: 2px solid #e5e5e5;
                padding-bottom: 0.5rem; margin-bottom: 1rem; }
    ul { list-style: none; padding: 0; display: grid;
         grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.6rem; }
    li a { display: block; padding: 0.7rem 1rem; border: 1px solid #e5e5e5;
           border-radius: 6px; text-decoration: none; color: #2563eb;
           font-size: 0.92rem; transition: border-color 0.15s, background 0.15s; }
    li a:hover { border-color: #2563eb; background: #f0f5ff; }
    footer { border-top: 1px solid #e5e5e5; margin-top: 4rem; padding-top: 1.5rem;
             color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(siteName)}</h1>
    <p>${escapeHtml(siteDesc)}</p>
  </header>
  <main>
    ${groupsHtml}
  </main>
  <footer>
    <p>© ${new Date().getFullYear()} ${escapeHtml(siteName)}</p>
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
    button { margin-top: 1.5rem; padding: 0.75rem 2rem; background: #2563eb;
             color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #1d4ed8; }
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