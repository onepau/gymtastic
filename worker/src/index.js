// Known bot user agents for server-side analytics
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

function renderPage(page, siteName, siteDesc) {
  const schemaBlock = page.schema_json
    ? `<script type="application/ld+json">${page.schema_json}</script>`
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
  const pageLinks = pages.map(p =>
    `<li><a href="/${p.slug}">${escapeHtml(p.title)}</a></li>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(siteDesc)}">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebSite","name":"${siteName}","url":"/"}
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           line-height: 1.7; color: #1a1a1a; max-width: 820px; margin: 0 auto;
           padding: 2rem 1.5rem; background: #fff; }
    h1 { font-size: 2.2rem; font-weight: 800; }
    ul { list-style: none; padding: 0; display: grid;
         grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }
    li a { display: block; padding: 0.8rem 1rem; border: 1px solid #e5e5e5;
           border-radius: 6px; text-decoration: none; color: #2563eb;
           transition: border-color 0.15s; font-size: 0.95rem; }
    li a:hover { border-color: #2563eb; }
    footer { border-top: 1px solid #e5e5e5; margin-top: 4rem; padding-top: 1.5rem;
             color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>${escapeHtml(siteName)}</h1>
  <p>${escapeHtml(siteDesc)}</p>
  <ul>
    ${pageLinks}
  </ul>
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
    console.log('env keys:', JSON.stringify(Object.keys(env)));
    console.log('DB:', env.DB);
    const url = new URL(request.url);
    const path = url.pathname;
    const userAgent = request.headers.get('user-agent') || '';
    const country = request.headers.get('cf-ipcountry') || 'XX';
    const bot = isBot(userAgent) ? 1 : 0;

    // XML sitemap
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
        'SELECT slug, title FROM pages ORDER BY id LIMIT 100'
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

    // Individual page (slug is everything after the leading slash)
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

    // Record the visit asynchronously (does not block the response)
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