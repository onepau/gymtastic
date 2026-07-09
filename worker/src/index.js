const BOT_PATTERNS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Googlebot",
  "GoogleOther",
  "bingbot",
  "AhrefsBot",
  "SemrushBot",
  "DotBot",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "facebookexternalhit",
  "Twitterbot",
];

function isBot(userAgent) {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((pattern) =>
    userAgent.toLowerCase().includes(pattern.toLowerCase()),
  );
}

function getSchemaForPage(page, host) {
  const base = {
    "@context": "https://schema.org",
    "@graph": [],
  };
  base["@graph"].push({
    "@type": "Article",
    headline: page.title,
    description: page.meta_description,
    url: `https://${host}/${page.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Gymtastic",
      url: `https://${host}`,
    },
  });
  if (page.page_type === "glossary") {
    base["@graph"].push({
      "@type": "DefinedTerm",
      name: page.title,
      description: page.meta_description,
    });
  }
  if (page.page_type === "how-to") {
    base["@graph"].push({
      "@type": "HowTo",
      name: page.title,
      description: page.meta_description,
    });
  }
  return JSON.stringify(base).replace(/</g, "\\u003c");
}

// ── Shared dark-theme base CSS ────────────────────────────────────────────────
const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;800&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  :root {
    --navy:   #0b1120;
    --deep:   #131c30;
    --gold:   #f5c518;
    --magenta:#e8005a;
    --blue:   #1e90ff;
    --text:   #f0f4ff;
    --muted:  #8a9bb0;
    --card:   #1a2540;
    --border: #2a3a56;
    --max:    1440px;
    --radius: 12px;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--navy);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  .container { max-width: var(--max); margin: 0 auto; padding: 0 24px; }

  .tag {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 4px;
  }
  .tag-gold    { background: var(--gold);    color: #000; }
  .tag-magenta { background: var(--magenta); color: #fff; }
  .tag-blue    { background: var(--blue);    color: #fff; }
  .tag-outline { border: 1px solid var(--border); color: var(--muted); }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    text-decoration: none;
  }
  .btn-gold { background: var(--gold); color: #000; }
  .btn-gold:hover {
    background: #ffd43b;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(245,197,24,0.3);
  }
  .btn-outline { background: transparent; color: var(--text); border: 2px solid var(--border); }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }

  .section-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
  }
  .section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(24px, 3vw, 36px);
    font-weight: 800;
    color: var(--text);
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;
  }

  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .fade-in.visible { opacity: 1; transform: translateY(0); }

  /* ── NAV ── */
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(11,17,32,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s;
  }
  nav.scrolled { border-bottom-color: var(--gold); }
  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: var(--gold);
    text-decoration: none;
    letter-spacing: 0.05em;
  }
  .logo span { color: var(--text); }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: color 0.2s;
    position: relative;
  }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0;
    width: 0; height: 2px;
    background: var(--gold);
    transition: width 0.2s;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-links a:hover::after { width: 100%; }
  .nav-right { display: flex; align-items: center; gap: 16px; }
  .live-badge {
    background: var(--magenta);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    padding: 4px 10px;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
  @media (max-width: 768px) { .nav-links, .nav-right { display: none; } }

  /* ── FOOTER ── */
  footer {
    background: var(--deep);
    border-top: 1px solid var(--border);
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  @media (max-width: 1023px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px)  { .footer-grid { grid-template-columns: 1fr; } }
  .footer-about .logo { display: block; margin-bottom: 16px; }
  .footer-about p { font-size: 14px; color: var(--muted); line-height: 1.7; }
  .footer-col h4 {
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 20px;
    color: var(--text);
  }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a { color: var(--muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
  .footer-col a:hover { color: var(--gold); }
  .social-links { display: flex; gap: 12px; margin-top: 24px; }
  .social-btn {
    width: 40px; height: 40px; border-radius: 8px;
    background: var(--card); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    text-decoration: none; font-size: 16px; transition: all 0.2s;
  }
  .social-btn:hover { border-color: var(--gold); background: rgba(245,197,24,0.1); }
  .footer-bottom {
    padding-top: 32px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: var(--muted);
    flex-wrap: wrap;
    gap: 12px;
  }
  .back-top {
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.2s;
  }
  .back-top:hover { border-color: var(--gold); color: var(--gold); }
`;

function gaSnippet(gaId) {
  if (!gaId) return "";
  return `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(gaId)}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${escapeHtml(gaId)}');
  </script>`;
}

function navHtml(siteName) {
  return `
  <nav id="nav">
    <div class="container nav-inner">
      <a href="/" class="logo">${escapeHtml(siteName)}</a>
      <ul class="nav-links">
        <li><a href="/#news">Articles</a></li>
        <li><a href="/#disciplines">Disciplines</a></li>
        <li><a href="/#facts">Facts</a></li>
      </ul>
      <div class="nav-right">
        <span class="live-badge">&#11044; LIVE</span>
      </div>
    </div>
  </nav>`;
}

function footerHtml(siteName, year) {
  return `
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-about">
          <a href="/" class="logo">${escapeHtml(siteName)}</a>
          <p>Your premier gymnastics reference. In-depth guides, glossary, how-tos, and more — covering every flip, twist, and landing.</p>
          <div class="social-links">
            <a href="#" class="social-btn" aria-label="Instagram">&#128248;</a>
            <a href="#" class="social-btn" aria-label="X / Twitter">&#120143;</a>
            <a href="#" class="social-btn" aria-label="YouTube">&#9654;</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Content</h4>
          <ul>
            <li><a href="/">All Articles</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Disciplines</h4>
          <ul>
            <li><a href="/#disciplines">Artistic</a></li>
            <li><a href="/#disciplines">Rhythmic</a></li>
            <li><a href="/#disciplines">Trampoline</a></li>
            <li><a href="/#disciplines">Acrobatic</a></li>
            <li><a href="/#disciplines">Parkour</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>About</h4>
          <ul>
            <li><a href="/admin">Admin</a></li>
            <li><a href="/robots.txt">Robots.txt</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${year} ${escapeHtml(siteName)}. All rights reserved.</span>
        <a href="#" class="back-top"
          onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">&#8593; Back to Top</a>
      </div>
    </div>
  </footer>`;
}

const PAGE_JS = `
  <script>
    const nav = document.getElementById('nav');
    if (nav) window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    const countObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.count;
        const step = target / (1400 / 16);
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = Math.floor(cur);
          if (cur >= target) clearInterval(t);
        }, 16);
        countObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));
  </script>`;

// ── Card image helper ────────────────────────────────────────────────────────
function cardImg(imageUrl, alt, extraClass = "") {
  if (imageUrl) {
    return `<div class="card-img${extraClass ? " " + extraClass : ""}">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" loading="lazy">
    </div>`;
  }
  // Gradient placeholder when no image is available
  const hue =
    (alt.charCodeAt(0) * 37 + alt.charCodeAt(1 % alt.length) * 13) % 360;
  return `<div class="card-img${extraClass ? " " + extraClass : ""} card-img-placeholder"
    style="background: linear-gradient(135deg,hsl(${hue},60%,15%),hsl(${(hue + 60) % 360},60%,20%));">
    <span class="placeholder-icon">&#127948;</span>
  </div>`;
}

function typeTag(pageType) {
  const map = {
    blog: ["tag-gold", "Article"],
    hub: ["tag-gold", "Hub Guide"],
    "how-to": ["tag-blue", "How-to"],
    glossary: ["tag-outline", "Glossary"],
    comparison: ["tag-blue", "Comparison"],
    listicle: ["tag-outline", "List"],
    review: ["tag-magenta", "Review"],
    landing: ["tag-gold", "Featured"],
    auto: ["tag-outline", "Article"],
    general: ["tag-outline", "Article"],
  };
  const [cls, label] = map[pageType] || ["tag-outline", pageType || "Article"];
  return `<span class="tag ${cls}">${label}</span>`;
}

// ── Homepage ─────────────────────────────────────────────────────────────────
function renderHomepage(
  pages,
  siteName,
  siteDesc,
  gaId,
  heroImageUrl,
  heroText,
  gscVerification,
) {
  const year = new Date().getFullYear();
  const gscMeta = gscVerification
    ? `\n  <meta name="google-site-verification" content="${escapeHtml(gscVerification)}">`
    : "";

  // Split by language; show English first, then others
  const enPages = pages.filter((p) => langFromSlug(p.slug) === "en");
  const otherPages = pages.filter((p) => langFromSlug(p.slug) !== "en");

  // First 3 English pages → news cards
  const featuredPage = enPages[0] || null;
  const sidePagesRaw = enPages.slice(1, 3);
  const remainingPages = enPages.slice(3);

  // Hero background
  const heroBg = heroImageUrl
    ? `url("${escapeHtml(heroImageUrl)}") center/cover no-repeat`
    : "linear-gradient(135deg, #1a2540 0%, #0b1120 100%)";

  const heroSection = `
  <section class="hero">
    <div class="hero-bg" style="background: linear-gradient(to right,rgba(11,17,32,0.95) 45%,rgba(11,17,32,0.3) 100%), ${heroBg};"></div>
    <div class="container">
      <div class="hero-content fade-in">
        <div class="hero-meta">
          <span class="tag tag-magenta">Featured</span>
          <span class="tag tag-gold">Gymnastics Reference</span>
        </div>
        <h1 class="hero-headline">
          ${
            escapeHtml(siteName)
              .replace(/([A-Z])/g, (m, c, i) => (i === 0 ? c : `<em>${c}</em>`))
              .replace("</em>", "</em>")
              .split("")[0] + escapeHtml(siteName).slice(1)
          }
          <br><em>Reference</em> Hub
        </h1>
        <p class="hero-desc">${escapeHtml(heroText || siteDesc)}</p>
        <div class="hero-actions">
          <a href="#news" class="btn btn-gold">Explore Articles &rarr;</a>
          <a href="#disciplines" class="btn btn-outline">Disciplines</a>
        </div>
      </div>
      <div class="hero-stat">
        <div class="num">${enPages.length}</div>
        <div class="label">Expert Articles</div>
      </div>
    </div>
    <div class="scroll-caret" aria-hidden="true">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M7 10l5 5 5-5"/>
      </svg>
    </div>
  </section>`;

  // ── Ticker (static scores, decorative)
  const ticker = `
  <div class="ticker" role="marquee" aria-label="Live scores" aria-live="off">
    <div class="ticker-track">
      <div class="ticker-item"><span class="flag">&#127482;&#127480;</span> Simone Biles &middot; Floor &middot; <span class="score">15.300</span> <span class="tag tag-gold">GOLD</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127471;&#127477;</span> Shinnosuke Oka &middot; Pommel &middot; <span class="score">14.866</span> <span class="tag tag-blue">SILVER</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127468;&#127463;</span> Jessica Gadirova &middot; Beam &middot; <span class="score">14.200</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127464;&#127475;</span> Zhang Boheng &middot; HBar &middot; <span class="score">15.066</span> <span class="tag tag-magenta">LIVE</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127463;&#127479;</span> Rebeca Andrade &middot; Vault &middot; <span class="score">14.900</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127462;&#127482;</span> Georgia Godwin &middot; UBars &middot; <span class="score">13.966</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127467;&#127479;</span> M&eacute;lanie de Jesus dos Santos &middot; Rhythmic &middot; <span class="score">34.250</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127482;&#127480;</span> Simone Biles &middot; Floor &middot; <span class="score">15.300</span> <span class="tag tag-gold">GOLD</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127471;&#127477;</span> Shinnosuke Oka &middot; Pommel &middot; <span class="score">14.866</span> <span class="tag tag-blue">SILVER</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127468;&#127463;</span> Jessica Gadirova &middot; Beam &middot; <span class="score">14.200</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127464;&#127475;</span> Zhang Boheng &middot; HBar &middot; <span class="score">15.066</span> <span class="tag tag-magenta">LIVE</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127463;&#127479;</span> Rebeca Andrade &middot; Vault &middot; <span class="score">14.900</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127462;&#127482;</span> Georgia Godwin &middot; UBars &middot; <span class="score">13.966</span></div>
      <div class="ticker-item ticker-sep">|</div>
      <div class="ticker-item"><span class="flag">&#127467;&#127479;</span> M&eacute;lanie de Jesus dos Santos &middot; Rhythmic &middot; <span class="score">34.250</span></div>
    </div>
  </div>`;

  // ── News section (first 3 pages from D1)
  const featuredCardHtml = featuredPage
    ? `<article class="card card-featured fade-in">
        ${cardImg(featuredPage.image_url, featuredPage.title, "card-img-featured")}
        <div class="card-body">
          <div class="card-meta">${typeTag(featuredPage.page_type)}</div>
          <h3 class="card-title">${escapeHtml(featuredPage.title)}</h3>
          <p class="card-desc">${escapeHtml(featuredPage.meta_description || "")}</p>
          <div class="card-footer-row">
            <a href="/${escapeHtml(featuredPage.slug)}" class="btn btn-gold" style="margin-top:0;padding:10px 20px;font-size:13px">Read More &rarr;</a>
          </div>
        </div>
      </article>`
    : "";

  const sideCardsHtml = sidePagesRaw
    .map(
      (
        p,
        i,
      ) => `<article class="card fade-in" style="transition-delay:${(i + 1) * 0.1}s">
        ${cardImg(p.image_url, p.title)}
        <div class="card-body">
          <div class="card-meta">${typeTag(p.page_type)}</div>
          <h3 class="card-title">${escapeHtml(p.title)}</h3>
          <p class="card-desc">${escapeHtml(p.meta_description || "")}</p>
          <div class="card-footer-row">
            <a href="/${escapeHtml(p.slug)}" class="card-link">Read more &rarr;</a>
          </div>
        </div>
      </article>`,
    )
    .join("\n");

  const newsSection =
    enPages.length > 0
      ? `
  <section class="news" id="news">
    <div class="container">
      <div class="section-header fade-in">
        <div>
          <div class="section-label">Latest</div>
          <h2 class="section-title">Top Articles</h2>
        </div>
        <a href="#all-content" class="btn btn-outline">All Content</a>
      </div>
      <div class="news-grid">
        ${featuredCardHtml}
        ${sideCardsHtml}
      </div>
    </div>
  </section>`
      : "";

  // ── Competitions (static)
  const competitionsSection = `
  <section class="competitions" id="competitions">
    <div class="container">
      <div class="section-header fade-in">
        <div>
          <div class="section-label">Schedule</div>
          <h2 class="section-title">Upcoming Competitions</h2>
        </div>
        <a href="https://www.gymnastics.sport/site/events/schedule.php" class="btn btn-outline" target="_blank" rel="noopener">Full Calendar</a>
      </div>
      <div class="comp-grid">
        <div class="comp-card fade-in">
          <div class="date-badge"><div class="day">12</div><div class="mon">Jul</div></div>
          <div class="comp-info">
            <h3 class="comp-title">2026 World Artistic Championships</h3>
            <p class="comp-venue"><span class="flag">&#127467;&#127479;</span> Paris, France &middot; Bercy Arena</p>
            <span class="tag tag-magenta">&#11044; Live Now</span>
          </div>
        </div>
        <div class="comp-card fade-in" style="transition-delay:0.1s">
          <div class="date-badge"><div class="day">19</div><div class="mon">Jul</div></div>
          <div class="comp-info">
            <h3 class="comp-title">World Cup &mdash; Stuttgart Grand Prix</h3>
            <p class="comp-venue"><span class="flag">&#127465;&#127466;</span> Stuttgart, Germany</p>
            <span class="tag tag-blue">Upcoming</span>
          </div>
        </div>
        <div class="comp-card fade-in" style="transition-delay:0.2s">
          <div class="date-badge"><div class="day">03</div><div class="mon">Aug</div></div>
          <div class="comp-info">
            <h3 class="comp-title">Trampoline World Cup &mdash; Tokyo</h3>
            <p class="comp-venue"><span class="flag">&#127471;&#127477;</span> Tokyo, Japan &middot; Ariake Arena</p>
            <span class="tag tag-blue">Upcoming</span>
          </div>
        </div>
        <div class="comp-card fade-in" style="transition-delay:0.1s">
          <div class="date-badge"><div class="day">08</div><div class="mon">Aug</div></div>
          <div class="comp-info">
            <h3 class="comp-title">Pan American Championships 2026</h3>
            <p class="comp-venue"><span class="flag">&#127463;&#127479;</span> S&atilde;o Paulo, Brazil</p>
            <span class="tag tag-blue">Upcoming</span>
          </div>
        </div>
        <div class="comp-card fade-in" style="transition-delay:0.2s">
          <div class="date-badge"><div class="day">20</div><div class="mon">Aug</div></div>
          <div class="comp-info">
            <h3 class="comp-title">FIG Rhythmic Grand Prix</h3>
            <p class="comp-venue"><span class="flag">&#127470;&#127481;</span> Milan, Italy</p>
            <span class="tag tag-blue">Upcoming</span>
          </div>
        </div>
        <div class="comp-card fade-in" style="transition-delay:0.3s">
          <div class="date-badge" style="background:var(--border)">
            <div class="day" style="color:var(--muted)">14</div>
            <div class="mon" style="color:var(--muted)">Jun</div>
          </div>
          <div class="comp-info">
            <h3 class="comp-title">European Artistic Championships</h3>
            <p class="comp-venue"><span class="flag">&#127470;&#127481;</span> Rimini, Italy &middot; RDS Stadium</p>
            <span class="tag tag-outline">Completed</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  // ── Disciplines (static)
  const disciplinesSection = `
  <section class="disciplines" id="disciplines">
    <div class="container">
      <div class="section-header fade-in">
        <div>
          <div class="section-label">Explore</div>
          <h2 class="section-title">Gymnastics Disciplines</h2>
        </div>
      </div>
      <div class="disc-scroll fade-in">
        <a href="/#all-content" class="disc-tile"><div class="disc-icon">&#129336;</div><div class="disc-name">Artistic</div><div class="disc-sub">Men's &amp; Women's</div></a>
        <a href="/#all-content" class="disc-tile"><div class="disc-icon">&#127992;</div><div class="disc-name">Rhythmic</div><div class="disc-sub">Hoops &middot; Ribbons &middot; Balls</div></a>
        <a href="/#all-content" class="disc-tile"><div class="disc-icon">&#129385;</div><div class="disc-name">Trampoline</div><div class="disc-sub">DMT &middot; Synchronised</div></a>
        <a href="/#all-content" class="disc-tile"><div class="disc-icon">&#129340;</div><div class="disc-name">Acrobatic</div><div class="disc-sub">Pairs &middot; Groups</div></a>
        <a href="/#all-content" class="disc-tile"><div class="disc-icon">&#128168;</div><div class="disc-name">Aerobic</div><div class="disc-sub">Individual &middot; Mixed</div></a>
        <a href="/#all-content" class="disc-tile"><div class="disc-icon">&#127939;</div><div class="disc-name">Parkour</div><div class="disc-sub">Speed &middot; Freestyle</div></a>
      </div>
    </div>
  </section>`;

  // ── Athlete spotlight (static)
  const athleteSection = `
  <section class="athlete" id="athlete">
    <div class="container">
      <div class="section-label fade-in">Athlete Spotlight</div>
      <div class="athlete-grid">
        <div class="athlete-img-wrap fade-in">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80"
            alt="Elite gymnast in competition leotard performing floor routine">
          <div class="athlete-img-badge">
            <div class="rank">#1</div>
            <div class="rank-label">World Ranking</div>
          </div>
        </div>
        <div class="fade-in" style="transition-delay:0.15s">
          <div class="section-label">Featured</div>
          <h2 class="athlete-name">Simone<br>Biles</h2>
          <p class="athlete-country">&#127482;&#127480; United States &middot; Artistic Gymnastics &middot; Age 29</p>
          <blockquote class="athlete-quote">
            &ldquo;I&rsquo;m not the next Usain Bolt or Michael Phelps &mdash; I&rsquo;m the first Simone Biles.&rdquo;
          </blockquote>
          <div class="stats-row">
            <div class="stat-block"><div class="stat-num" data-count="37">0</div><div class="stat-label">World Medals</div></div>
            <div class="stat-block"><div class="stat-num" data-count="7">0</div><div class="stat-label">Olympic Golds</div></div>
            <div class="stat-block"><div class="stat-num" data-count="8">0</div><div class="stat-label">Named Skills</div></div>
          </div>
          <a href="/#all-content" class="btn btn-gold">Explore Articles &rarr;</a>
        </div>
      </div>
    </div>
  </section>`;

  // ── Facts (static)
  const factsSection = `
  <section class="facts" id="facts">
    <div class="container">
      <div class="section-header fade-in">
        <div>
          <div class="section-label">Did You Know?</div>
          <h2 class="section-title">Gymnastics by the Numbers</h2>
        </div>
      </div>
      <div class="facts-grid">
        <div class="fact-card fade-in"><div class="fact-icon">&#127885;</div><div class="fact-num">1896</div><p class="fact-text">Gymnastics has been a core Olympic sport since the very first modern Games in Athens &mdash; one of only four original sports still contested today.</p></div>
        <div class="fact-card fade-in" style="transition-delay:0.1s"><div class="fact-icon">&#9889;</div><div class="fact-num">28 mph</div><p class="fact-text">The speed gymnasts reach at the end of a vault runway &mdash; equivalent to a sprinting Olympic 100m athlete.</p></div>
        <div class="fact-card fade-in" style="transition-delay:0.2s"><div class="fact-icon">&#127758;</div><div class="fact-num">150+</div><p class="fact-text">Countries affiliated with the F&eacute;d&eacute;ration Internationale de Gymnastique (FIG), making gymnastics one of the world&rsquo;s most widespread sports.</p></div>
        <div class="fact-card fade-in" style="transition-delay:0.1s"><div class="fact-icon">&#128260;</div><div class="fact-num">2.5x</div><p class="fact-text">Twists performed in a Biles-II vault &mdash; the hardest vault in the code of points, with a D-score of 6.6.</p></div>
        <div class="fact-card fade-in" style="transition-delay:0.2s"><div class="fact-icon">&#129504;</div><div class="fact-num">4 yrs</div><p class="fact-text">Elite gymnasts train 35+ hours per week over a four-year Olympic cycle &mdash; that&rsquo;s over 7,000 hours per Games.</p></div>
        <div class="fact-card fade-in" style="transition-delay:0.3s"><div class="fact-icon">&#127919;</div><div class="fact-num">0.001</div><p class="fact-text">Margin in seconds separating gold and silver in trampoline synchronisation &mdash; judged to three decimal places.</p></div>
      </div>
    </div>
  </section>`;

  // ── All content section (remaining pages + other-language pages)
  const allContentPages = [...remainingPages, ...otherPages];
  let allContentHtml = "";
  if (allContentPages.length > 0) {
    const typeOrder = [
      "hub",
      "how-to",
      "blog",
      "glossary",
      "comparison",
      "listicle",
      "review",
      "landing",
      "auto",
      "general",
    ];
    const typeLabels = {
      blog: "Articles",
      hub: "Topic Guides",
      "how-to": "How-to Guides",
      glossary: "Glossary",
      comparison: "Comparisons",
      listicle: "Lists",
      review: "Reviews",
      landing: "Topics",
      auto: "General",
      general: "General",
    };
    const groups = {};
    for (const p of allContentPages) {
      const t = p.page_type || "general";
      if (!groups[t]) groups[t] = [];
      groups[t].push(p);
    }
    const groupsHtml = Object.keys(groups)
      .sort((a, b) => {
        const ai = typeOrder.indexOf(a),
          bi = typeOrder.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
      .map((type) => {
        const label = typeLabels[type] || type;
        const cards = groups[type]
          .map(
            (p) =>
              `<a class="mini-card" href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>`,
          )
          .join("");
        return `<div class="content-group fade-in">
          <p class="content-group-label">${escapeHtml(label)}</p>
          <div class="mini-card-grid">${cards}</div>
        </div>`;
      })
      .join("\n");

    allContentHtml = `
  <section class="all-content" id="all-content">
    <div class="container">
      <div class="section-header fade-in">
        <div>
          <div class="section-label">Complete Library</div>
          <h2 class="section-title">All Content</h2>
        </div>
      </div>
      ${groupsHtml}
    </div>
  </section>`;
  }

  // ── Newsletter
  const newsletterSection = `
  <section class="newsletter">
    <div class="container">
      <div class="newsletter-inner fade-in">
        <div class="section-label">Stay in the Loop</div>
        <h2>Never Miss a <em style="color:var(--gold);font-style:normal">Routine</em></h2>
        <p>Get the latest gymnastics articles, guides, and competition coverage delivered to your inbox.</p>
        <form class="newsletter-form" onsubmit="return false;">
          <input type="email" class="newsletter-input" placeholder="your@email.com" aria-label="Email address">
          <button type="submit" class="btn btn-gold">Subscribe</button>
        </form>
        <p class="newsletter-micro">No spam. Just gymnastics. Unsubscribe anytime.</p>
      </div>
    </div>
  </section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(siteDesc)}">${gscMeta}
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: "https://gymtastic.cc", description: siteDesc }).replace(/</g, "\\u003c")}</script>
  ${gaSnippet(gaId)}
  <style>
    ${BASE_CSS}

    /* ── TICKER ── */
    .ticker { background: var(--gold); color: #000; padding: 10px 0; overflow: hidden; }
    .ticker-track {
      display: flex;
      gap: 64px;
      width: max-content;
      animation: ticker 30s linear infinite;
    }
    .ticker-track:hover { animation-play-state: paused; }
    @keyframes ticker {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .ticker-item { display: flex; align-items: center; gap: 12px; white-space: nowrap; font-size: 13px; font-weight: 700; }
    .ticker-item .flag { font-size: 16px; }
    .ticker-item .score { font-family: 'Bebas Neue', sans-serif; font-size: 18px; }
    .ticker-sep { opacity: 0.4; }

    /* ── HERO ── */
    .hero {
      position: relative;
      min-height: 88vh;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      padding-bottom: 80px;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      animation: kenburns 14s ease-in-out infinite alternate;
    }
    @keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.06); } }
    .hero-content { position: relative; z-index: 1; max-width: 680px; }
    .hero-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .hero-headline {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(52px, 7vw, 92px);
      line-height: 1;
      color: var(--text);
      margin-bottom: 20px;
    }
    .hero-headline em { color: var(--gold); font-style: normal; }
    .hero-desc { font-size: 17px; color: var(--muted); max-width: 520px; margin-bottom: 32px; }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
    .hero-stat {
      position: absolute;
      right: 80px; bottom: 80px;
      z-index: 1;
      text-align: center;
      display: none;
    }
    @media (min-width: 1024px) { .hero-stat { display: block; } }
    .hero-stat .num { font-family: 'Bebas Neue', sans-serif; font-size: 88px; color: var(--gold); line-height: 1; }
    .hero-stat .label { font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }
    .scroll-caret {
      position: absolute;
      bottom: 24px; left: 50%;
      transform: translateX(-50%);
      color: var(--muted);
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%,100% { transform: translateX(-50%) translateY(0); }
      50%      { transform: translateX(-50%) translateY(8px); }
    }

    /* ── NEWS CARDS ── */
    .news { padding: 80px 0; }
    .news-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    @media (max-width: 1023px) { .news-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 767px)  { .news-grid { grid-template-columns: 1fr; } }
    .news-grid .card-featured { grid-column: span 2; }
    @media (max-width: 767px) { .news-grid .card-featured { grid-column: span 1; } }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      color: inherit;
    }
    .card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
    .card:hover .card-img img { transform: scale(1.05); }
    .card-img { overflow: hidden; aspect-ratio: 16/9; }
    .card-img-featured { aspect-ratio: 21/9; }
    .card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
    .card-img-placeholder {
      display: flex; align-items: center; justify-content: center;
      font-size: 48px;
    }
    .placeholder-icon { filter: opacity(0.3); }
    .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .card-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 17px; font-weight: 800;
      line-height: 1.3; margin-bottom: 10px;
      color: var(--text);
    }
    .card-featured .card-title { font-size: clamp(20px, 2vw, 26px); }
    .card-desc { font-size: 14px; color: var(--muted); flex: 1; }
    .card-footer-row {
      display: flex; align-items: center;
      margin-top: 16px; padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .card-link { color: var(--gold); font-size: 13px; font-weight: 700; text-decoration: none; }
    .card-link:hover { color: #ffd43b; }

    /* ── COMPETITIONS ── */
    .competitions { padding: 80px 0; background: var(--deep); }
    .comp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    @media (max-width: 1023px) { .comp-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 767px)  { .comp-grid { grid-template-columns: 1fr; } }
    .comp-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 24px;
      display: flex; gap: 20px; align-items: flex-start;
      transition: border-color 0.2s, transform 0.2s;
    }
    .comp-card:hover { border-color: var(--gold); transform: translateY(-4px); }
    .date-badge {
      min-width: 56px; text-align: center;
      background: var(--gold); border-radius: 8px; padding: 10px 8px;
    }
    .date-badge .day { font-family: 'Bebas Neue', sans-serif; font-size: 32px; line-height: 1; color: #000; }
    .date-badge .mon { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #000; letter-spacing: 0.1em; }
    .comp-info { flex: 1; }
    .comp-title { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 800; margin-bottom: 6px; }
    .comp-venue { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
    .comp-venue .flag { margin-right: 6px; }

    /* ── DISCIPLINES ── */
    .disciplines { padding: 80px 0; }
    .disc-scroll {
      display: flex; gap: 20px;
      overflow-x: auto; padding-bottom: 16px;
      scrollbar-width: thin; scrollbar-color: var(--border) transparent;
    }
    .disc-tile {
      min-width: 180px; border-radius: var(--radius);
      padding: 28px 20px; text-align: center;
      cursor: pointer; text-decoration: none;
      border: 1px solid var(--border);
      transition: all 0.2s; background: var(--card);
    }
    .disc-tile:hover { border-color: var(--gold); transform: translateY(-4px); }
    .disc-icon { font-size: 40px; margin-bottom: 12px; }
    .disc-name { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
    .disc-sub { font-size: 12px; color: var(--muted); }

    /* ── ATHLETE SPOTLIGHT ── */
    .athlete { padding: 80px 0; background: var(--deep); }
    .athlete-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    @media (max-width: 767px) { .athlete-grid { grid-template-columns: 1fr; } }
    .athlete-img-wrap { position: relative; border-radius: var(--radius); overflow: hidden; }
    .athlete-img-wrap img { width: 100%; aspect-ratio: 3/4; object-fit: cover; }
    .athlete-img-badge {
      position: absolute; bottom: 20px; left: 20px;
      background: rgba(11,17,32,0.9);
      border: 1px solid var(--gold);
      border-radius: 8px; padding: 12px 16px;
    }
    .athlete-img-badge .rank { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: var(--gold); line-height: 1; }
    .athlete-img-badge .rank-label { font-size: 11px; color: var(--muted); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
    .athlete-name { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px,5vw,72px); line-height: 1; margin: 16px 0; }
    .athlete-country { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
    .athlete-quote { font-style: italic; font-size: 18px; color: var(--gold); border-left: 3px solid var(--gold); padding-left: 20px; margin: 24px 0; line-height: 1.5; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
    .stat-block { text-align: center; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px 12px; }
    .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: var(--gold); line-height: 1; }
    .stat-label { font-size: 12px; color: var(--muted); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }

    /* ── FACTS ── */
    .facts { padding: 80px 0; }
    .facts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    @media (max-width: 1023px) { .facts-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 767px)  { .facts-grid { grid-template-columns: 1fr; } }
    .fact-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 28px;
      position: relative; overflow: hidden; transition: transform 0.2s;
    }
    .fact-card:hover { transform: translateY(-4px); }
    .fact-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .fact-card:nth-child(1)::before { background: var(--gold); }
    .fact-card:nth-child(2)::before { background: var(--magenta); }
    .fact-card:nth-child(3)::before { background: var(--blue); }
    .fact-card:nth-child(4)::before { background: #9b59b6; }
    .fact-card:nth-child(5)::before { background: #00c9a7; }
    .fact-card:nth-child(6)::before { background: #ff6b35; }
    .fact-icon { font-size: 36px; margin-bottom: 16px; }
    .fact-num { font-family: 'Bebas Neue', sans-serif; font-size: 52px; color: var(--gold); line-height: 1; margin-bottom: 4px; }
    .fact-text { font-size: 15px; color: var(--muted); line-height: 1.5; }

    /* ── ALL CONTENT GRID ── */
    .all-content { padding: 80px 0; background: var(--deep); }
    .content-group { margin-bottom: 2.5rem; }
    .content-group-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.72rem; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.12em;
      color: var(--gold);
      border-left: 3px solid var(--gold);
      padding-left: 0.6rem;
      margin: 0 0 0.75rem;
    }
    .mini-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem; }
    .mini-card {
      display: block;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      text-decoration: none;
      color: var(--text);
      font-size: 0.92rem;
      font-weight: 600;
      line-height: 1.4;
      background: var(--card);
      transition: border-color 0.15s, color 0.15s;
    }
    .mini-card:hover { border-color: var(--gold); color: var(--gold); }

    /* ── NEWSLETTER ── */
    .newsletter {
      padding: 96px 0;
      background: linear-gradient(135deg, #0f1a35 0%, #1a0a20 100%);
      position: relative; overflow: hidden;
    }
    .newsletter::before {
      content: '';
      position: absolute;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(245,197,24,0.07) 0%, transparent 70%);
      top: -200px; right: -100px;
    }
    .newsletter-inner { text-align: center; position: relative; z-index: 1; max-width: 560px; margin: 0 auto; }
    .newsletter h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px,5vw,64px); line-height: 1.1; margin-bottom: 16px; }
    .newsletter p { color: var(--muted); margin-bottom: 36px; }
    .newsletter-form { display: flex; gap: 12px; }
    @media (max-width: 600px) { .newsletter-form { flex-direction: column; } }
    .newsletter-input {
      flex: 1; background: var(--card);
      border: 1px solid var(--border); border-radius: 8px;
      padding: 14px 18px; color: var(--text); font-size: 15px; outline: none;
    }
    .newsletter-input:focus { border-color: var(--gold); }
    .newsletter-input::placeholder { color: var(--muted); }
    .newsletter-micro { margin-top: 14px; font-size: 12px; color: var(--muted); }
  </style>
</head>
<body>
  ${navHtml(siteName)}
  ${ticker}
  ${heroSection}
  ${newsSection}
  ${competitionsSection}
  ${disciplinesSection}
  ${athleteSection}
  ${factsSection}
  ${allContentHtml}
  ${newsletterSection}
  ${footerHtml(siteName, year)}
  ${PAGE_JS}
</body>
</html>`;
}

// ── Individual article page ───────────────────────────────────────────────────
function renderPage(page, siteName, siteDesc, gaId) {
  const lang = langFromSlug(page.slug);
  const year = new Date().getFullYear();
  const schemaBlock = `<script type="application/ld+json">${getSchemaForPage(page, "gymtastic.cc")}</script>`;

  const featuredImage = page.image_url
    ? `<img class="article-hero-img" src="${escapeHtml(page.image_url)}" alt="${escapeHtml(page.title)}" loading="eager">`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title)} | ${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(page.meta_description || "")}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.meta_description || "")}">
  <meta property="og:type" content="article">
  ${page.image_url ? `<meta property="og:image" content="${escapeHtml(page.image_url)}">` : ""}
  <link rel="canonical" href="/${escapeHtml(page.slug)}">
  ${schemaBlock}
  ${gaSnippet(gaId)}
  <style>
    ${BASE_CSS}

    /* ── ARTICLE LAYOUT ── */
    .article-wrap { max-width: 820px; margin: 0 auto; padding: 60px 24px 80px; }

    .breadcrumb {
      font-size: 0.82rem; color: var(--muted);
      margin-bottom: 1.75rem;
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--gold); }
    .breadcrumb span { color: var(--muted); }

    .article-type { margin-bottom: 1rem; }

    h1.article-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(40px, 6vw, 72px);
      line-height: 1.05;
      color: var(--text);
      margin-bottom: 1.5rem;
    }

    .article-hero-img {
      width: 100%;
      max-height: 480px;
      object-fit: cover;
      border-radius: var(--radius);
      margin-bottom: 2.5rem;
      border: 1px solid var(--border);
    }

    /* ── Article body content ── */
    .article-body { color: var(--text); }
    .article-body p { margin: 0 0 1.4rem; font-size: 1.0625rem; line-height: 1.75; color: #d4daf0; }
    .article-body h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.75rem; font-weight: 800;
      color: var(--text);
      margin-top: 2.75rem; padding-top: 2.75rem;
      border-top: 1px solid var(--border);
      margin-bottom: 1rem;
    }
    .article-body h3 {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.25rem; font-weight: 800;
      color: var(--text);
      margin-top: 2rem; margin-bottom: 0.75rem;
    }
    .article-body h4 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700; color: var(--text);
      margin-top: 1.5rem; margin-bottom: 0.5rem;
    }
    .article-body a { color: var(--gold); text-decoration: none; }
    .article-body a:hover { text-decoration: underline; text-decoration-color: var(--gold); }
    .article-body ul, .article-body ol { padding-left: 1.5rem; margin-bottom: 1.4rem; }
    .article-body li { margin-bottom: 0.5rem; font-size: 1.0625rem; line-height: 1.7; color: #d4daf0; }
    .article-body blockquote {
      border-left: 3px solid var(--gold);
      padding-left: 1.25rem;
      margin: 2rem 0;
      font-style: italic;
      color: var(--gold);
      font-size: 1.1rem;
    }
    .article-body table { border-collapse: collapse; width: 100%; margin: 1.75rem 0; font-size: 0.95rem; }
    .article-body th, .article-body td { border: 1px solid var(--border); padding: 0.65rem 1rem; text-align: left; }
    .article-body th { background: var(--card); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text); }
    .article-body tr:nth-child(even) td { background: rgba(26,37,64,0.5); }
    .article-body code { background: var(--card); padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.875em; border: 1px solid var(--border); color: var(--gold); }
    .article-body pre { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; overflow-x: auto; margin-bottom: 1.4rem; }
    .article-body pre code { background: none; border: none; padding: 0; color: var(--text); }
    .article-body img { max-width: 100%; border-radius: 8px; border: 1px solid var(--border); margin: 1rem 0; }
    .article-body strong { color: var(--text); font-weight: 700; }
  </style>
</head>
<body>
  ${navHtml(siteName)}
  <div class="article-wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a> &rsaquo; <span>${escapeHtml(page.title)}</span>
    </nav>
    <div class="article-type">${typeTag(page.page_type)}</div>
    <h1 class="article-title">${escapeHtml(page.title)}</h1>
    ${featuredImage}
    <div class="article-body">
      ${page.body_html || ""}
    </div>
  </div>
  ${footerHtml(siteName, year)}
  ${PAGE_JS}
</body>
</html>`;
}

function renderSitemap(pages, host) {
  const urls = pages
    .map(
      (p) =>
        `<url><loc>https://${host}/${escapeHtml(p.slug)}</loc><changefreq>monthly</changefreq></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://${host}/</loc><changefreq>weekly</changefreq></url>
  ${urls}
</urlset>`;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function langFromSlug(slug) {
  const m = slug.match(/^([a-z]{2})\//);
  return m ? m[1] : "en";
}

const ADMIN_COOKIE = "admin_session";

function getAdminCookie(request) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ADMIN_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

async function isAuthenticated(request, adminToken) {
  return verifySessionToken(getAdminCookie(request), adminToken);
}

function setSessionCookie(value, clear = false) {
  const cookieValue = clear ? "" : encodeURIComponent(value);
  const maxAge = clear ? 0 : 60 * 60 * 8;
  return `${ADMIN_COOKIE}=${cookieValue}; HttpOnly; Secure; Path=/admin; SameSite=Strict; Max-Age=${maxAge}`;
}

async function hmacSign(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const [macA, macB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, enc.encode(a)),
    crypto.subtle.sign("HMAC", key, enc.encode(b)),
  ]);
  const va = new Uint8Array(macA);
  const vb = new Uint8Array(macB);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

async function createSessionToken(adminToken) {
  const expiry = Date.now() + 8 * 60 * 60 * 1000;
  const sig = await hmacSign(adminToken, String(expiry));
  return `${expiry}.${sig}`;
}

async function verifySessionToken(cookieValue, adminToken) {
  if (!cookieValue) return false;
  const dot = cookieValue.lastIndexOf(".");
  if (dot === -1) return false;
  const expiry = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (Date.now() > Number(expiry)) return false;
  const expected = await hmacSign(adminToken, expiry);
  return timingSafeEqual(sig, expected);
}

function securityHeaders(isAdmin = false) {
  const csp = isAdmin
    ? `default-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'`
    : `default-src 'self'; script-src 'self' https://www.googletagmanager.com 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src * data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;
  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };
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
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
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
  const rows = pages
    .map(
      (p) => `
    <tr>
      <td><a href="/admin/edit?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></td>
      <td><code>/${escapeHtml(p.slug)}</code></td>
      <td><span class="tag">${escapeHtml(p.page_type || "")}</span></td>
      <td><a href="/admin/edit?slug=${encodeURIComponent(p.slug)}">Edit</a></td>
    </tr>`,
    )
    .join("");

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
  const val = (f) => (page ? escapeHtml(page[f] || "") : "");
  const pageTypes = [
    "blog",
    "hub",
    "how-to",
    "glossary",
    "comparison",
    "listicle",
    "review",
    "landing",
  ];
  const typeOptions = pageTypes
    .map((t) => {
      const selected = isEdit && page.page_type === t ? " selected" : "";
      const labels = {
        blog: "Article",
        hub: "Hub / Topic guide",
        "how-to": "How-to guide",
        glossary: "Glossary",
        comparison: "Comparison",
        listicle: "List",
        review: "Review",
        landing: "Landing page",
      };
      return `<option value="${t}"${selected}>${labels[t] || t}</option>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEdit ? "Edit" : "Add"} page — Admin</title>
  <style>${adminStyles()}</style>
</head>
<body>
  <h1>${isEdit ? "Edit page" : "Add a new page"}</h1>
  <p class="subtitle"><a href="/admin">&larr; Back to all pages</a></p>
  <form method="POST" action="/admin/save">
    <label for="slug">Slug (URL path)</label>
    <input type="text" id="slug" name="slug" required value="${val("slug")}"
      placeholder="gymnastics-scoring-guide" ${isEdit ? 'readonly style="background:#f3f4f6;color:#6b7280"' : ""}>
    ${isEdit ? '<p class="hint">Slug cannot be changed after creation.</p>' : ""}

    <label for="title">Title</label>
    <input type="text" id="title" name="title" required value="${val("title")}">

    <label for="meta_description">Meta description</label>
    <input type="text" id="meta_description" name="meta_description" value="${val("meta_description")}">

    <label for="keyword">Keyword</label>
    <input type="text" id="keyword" name="keyword" value="${val("keyword")}">

    <label for="image_url">Featured image URL</label>
    <input type="url" id="image_url" name="image_url" value="${val("image_url")}"
      placeholder="https://example.com/image.jpg">
    <p class="hint">Link to an image hosted externally (e.g. Cloudflare R2, Unsplash, Imgur).</p>

    <label for="page_type">Page type</label>
    <select id="page_type" name="page_type">${typeOptions}</select>

    <label for="body_html">Content (HTML)</label>
    <textarea id="body_html" name="body_html" required placeholder="<p>Your content here...</p>">${val("body_html")}</textarea>

    <button class="btn" type="submit">${isEdit ? "Save changes" : "Save page"}</button>
    <a class="btn btn-secondary" href="/admin">Cancel</a>
  </form>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const userAgent = request.headers.get("user-agent") || "";
    const country = request.headers.get("cf-ipcountry") || "XX";
    const bot = isBot(userAgent) ? 1 : 0;
    const ADMIN_TOKEN = env.ADMIN_TOKEN;

    if (path.startsWith("/admin") && !ADMIN_TOKEN) {
      return new Response("Admin disabled: ADMIN_TOKEN not configured", {
        status: 503,
      });
    }

    // 4.3: verify same-site origin on all admin POSTs
    if (path.startsWith("/admin") && request.method === "POST") {
      const secFetchSite = request.headers.get("Sec-Fetch-Site");
      const origin = request.headers.get("Origin");
      if (
        secFetchSite &&
        secFetchSite !== "same-origin" &&
        secFetchSite !== "none"
      ) {
        return new Response("Forbidden", { status: 403 });
      }
      if (!secFetchSite && origin && origin !== `https://${url.host}`) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const GA_ID = env.GA_MEASUREMENT_ID || "";
    const GSC_VERIFICATION = env.GSC_VERIFICATION || "";
    const HERO_IMAGE_URL = env.HERO_IMAGE_URL || "";
    const HERO_TEXT = env.HERO_TEXT || "";

    // Admin — login page
    if (path === "/admin/login") {
      if (request.method === "POST") {
        const formData = await request.formData();
        const token = formData.get("token")?.trim() ?? "";
        if (!(await timingSafeEqual(token, ADMIN_TOKEN))) {
          return new Response(
            renderAdminLogin("Incorrect password. Please try again."),
            {
              status: 401,
              headers: {
                "Content-Type": "text/html; charset=UTF-8",
                ...securityHeaders(true),
              },
            },
          );
        }
        const sessionToken = await createSessionToken(ADMIN_TOKEN);
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/admin",
            "Set-Cookie": setSessionCookie(sessionToken),
          },
        });
      }
      if (await isAuthenticated(request, ADMIN_TOKEN)) {
        return redirect("/admin");
      }
      return new Response(renderAdminLogin(), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin — logout
    if (path === "/admin/logout" && request.method === "POST") {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/admin/login",
          "Set-Cookie": setSessionCookie("", true),
        },
      });
    }

    // Guard: all remaining /admin routes require session cookie
    if (path.startsWith("/admin")) {
      if (!(await isAuthenticated(request, ADMIN_TOKEN))) {
        return redirect("/admin/login");
      }
    }

    // Admin — page list
    if (path === "/admin") {
      const { results } = await env.DB.prepare(
        "SELECT slug, title, page_type FROM pages ORDER BY page_type, title LIMIT 1000",
      ).all();
      return new Response(renderAdminPageList(results), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin — new page form
    if (path === "/admin/new") {
      return new Response(renderAdminForm(null), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin — edit existing page
    if (path === "/admin/edit") {
      const slug = url.searchParams.get("slug");
      if (!slug) return redirect("/admin");
      const page = await env.DB.prepare("SELECT * FROM pages WHERE slug = ?")
        .bind(slug)
        .first();
      if (!page) return new Response("Page not found", { status: 404 });
      return new Response(renderAdminForm(page), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin save (handles both create and update via INSERT OR REPLACE)
    if (path === "/admin/save" && request.method === "POST") {
      const formData = await request.formData();
      const slug = formData
        .get("slug")
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      const title = formData.get("title")?.trim();
      const meta_description = formData.get("meta_description")?.trim();
      const keyword = formData.get("keyword")?.trim();
      const page_type = formData.get("page_type")?.trim();
      const body_html = formData.get("body_html")?.trim();

      // 3.3: strict slug validation — plain slugs or lang-prefixed (e.g. de/slug)
      if (!slug || !/^(?:[a-z]{2}\/)?[a-z0-9-]{1,200}$/.test(slug)) {
        return new Response(
          "Invalid slug: use only lowercase letters, numbers, and hyphens. Language prefix allowed (e.g. de/slug)",
          { status: 400 },
        );
      }
      if (!title || !body_html) {
        return new Response("Missing required fields", { status: 400 });
      }

      // 3.2: strip the most dangerous constructs from body_html before storing
      const safe_body_html = body_html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
        .replace(/\bhref\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, "")
        .replace(/\bsrc\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, "");

      // 3.4: only allow https image URLs
      let image_url = formData.get("image_url")?.trim() || null;
      if (image_url) {
        try {
          if (new URL(image_url).protocol !== "https:") image_url = null;
        } catch {
          image_url = null;
        }
      }

      await env.DB.prepare(
        "INSERT OR REPLACE INTO pages (slug, title, meta_description, keyword, page_type, body_html, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          slug,
          title,
          meta_description,
          keyword,
          page_type,
          safe_body_html,
          image_url,
        )
        .run();
      return redirect(`/${slug}`);
    }

    // Sitemap
    if (path === "/sitemap.xml") {
      const { results } = await env.DB.prepare(
        "SELECT slug FROM pages ORDER BY id LIMIT 50000",
      ).all();
      return new Response(renderSitemap(results, url.host), {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // robots.txt
    if (path === "/robots.txt") {
      return new Response(
        `User-agent: *\nAllow: /\nSitemap: https://${url.host}/sitemap.xml\n`,
        { headers: { "Content-Type": "text/plain" } },
      );
    }

    // Homepage
    if (path === "/" || path === "") {
      const { results } = await env.DB.prepare(
        "SELECT slug, title, page_type, meta_description, image_url FROM pages ORDER BY page_type, title LIMIT 500",
      ).all();
      ctx.waitUntil(
        env.DB.prepare(
          "INSERT INTO analytics (page_slug, user_agent, country, is_bot) VALUES (?, ?, ?, ?)",
        )
          .bind("/", userAgent.slice(0, 200), country, bot)
          .run(),
      );
      return new Response(
        renderHomepage(
          results,
          env.SITE_NAME,
          env.SITE_DESCRIPTION,
          GA_ID,
          HERO_IMAGE_URL,
          HERO_TEXT,
          GSC_VERIFICATION,
        ),
        {
          headers: {
            "Content-Type": "text/html; charset=UTF-8",
            "Cache-Control": "public, max-age=300",
            ...securityHeaders(),
          },
        },
      );
    }

    // Individual pages
    const slug = path.slice(1).replace(/\/$/, "");
    if (!slug || slug.includes("..") || slug.includes("<")) {
      return new Response("Not found", { status: 404 });
    }
    const page = await env.DB.prepare("SELECT * FROM pages WHERE slug = ?")
      .bind(slug)
      .first();
    if (!page) {
      return new Response("Page not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }
    ctx.waitUntil(
      env.DB.prepare(
        "INSERT INTO analytics (page_slug, user_agent, country, is_bot) VALUES (?, ?, ?, ?)",
      )
        .bind(slug, userAgent.slice(0, 200), country, bot)
        .run(),
    );
    return new Response(
      renderPage(page, env.SITE_NAME, env.SITE_DESCRIPTION, GA_ID),
      {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
          "X-Robots-Tag": "index, follow",
          ...securityHeaders(),
        },
      },
    );
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      env.DB.prepare(
        "DELETE FROM analytics WHERE visited_at < datetime('now', '-90 days')",
      ).run(),
    );
  },
};
