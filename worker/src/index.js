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
            <li><a href="/discipline/artistic-gymnastics">Artistic</a></li>
            <li><a href="/discipline/rhythmic-gymnastics">Rhythmic</a></li>
            <li><a href="/discipline/trampoline">Trampoline</a></li>
            <li><a href="/discipline/acrobatic-gymnastics">Acrobatic</a></li>
            <li><a href="/discipline/parkour">Parkour</a></li>
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
        <a href="/discipline/artistic-gymnastics" class="disc-tile"><div class="disc-icon">&#129336;</div><div class="disc-name">Artistic</div><div class="disc-sub">Men's &amp; Women's</div></a>
        <a href="/discipline/rhythmic-gymnastics" class="disc-tile"><div class="disc-icon">&#127992;</div><div class="disc-name">Rhythmic</div><div class="disc-sub">Hoops &middot; Ribbons &middot; Balls</div></a>
        <a href="/discipline/trampoline" class="disc-tile"><div class="disc-icon">&#129385;</div><div class="disc-name">Trampoline</div><div class="disc-sub">DMT &middot; Synchronised</div></a>
        <a href="/discipline/acrobatic-gymnastics" class="disc-tile"><div class="disc-icon">&#129340;</div><div class="disc-name">Acrobatic</div><div class="disc-sub">Pairs &middot; Groups</div></a>
        <a href="/discipline/aerobic-gymnastics" class="disc-tile"><div class="disc-icon">&#128168;</div><div class="disc-name">Aerobic</div><div class="disc-sub">Individual &middot; Mixed</div></a>
        <a href="/discipline/parkour" class="disc-tile"><div class="disc-icon">&#127939;</div><div class="disc-name">Parkour</div><div class="disc-sub">Speed &middot; Freestyle</div></a>
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

// ── Individual article page (flagship template) ───────────────────────────────
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

// ── Individual article page (legacy template) ─────────────────────────────────
function renderLegacyPage(page, siteName, gaId) {
  const lang = langFromSlug(page.slug);
  const year = new Date().getFullYear();
  const schemaBlock = `<script type="application/ld+json">${getSchemaForPage(page, "gymtastic.cc")}</script>`;
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
  <link rel="canonical" href="/${escapeHtml(page.slug)}">
  ${schemaBlock}
  ${gaSnippet(gaId)}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #fff; color: #111827; line-height: 1.7; }
    a { color: #1d4ed8; }
    .site-header { border-bottom: 1px solid #e5e7eb; padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .site-header a.logo { font-weight: 800; font-size: 1.1rem; color: #111827; text-decoration: none; letter-spacing: -0.02em; }
    .site-header nav { margin-left: auto; font-size: 0.85rem; display: flex; gap: 1.25rem; }
    .site-header nav a { color: #6b7280; text-decoration: none; }
    .site-header nav a:hover { color: #111827; }
    .article-wrap { max-width: 720px; margin: 0 auto; padding: 48px 24px 72px; }
    .breadcrumb { font-size: 0.8rem; color: #9ca3af; margin-bottom: 1.5rem; }
    .breadcrumb a { color: #9ca3af; text-decoration: none; }
    h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; line-height: 1.2; margin-bottom: 1.5rem; color: #111827; }
    .article-body p { margin-bottom: 1.25rem; font-size: 1rem; color: #374151; }
    .article-body h2 { font-size: 1.4rem; font-weight: 700; margin: 2.5rem 0 0.75rem; color: #111827; border-top: 1px solid #e5e7eb; padding-top: 2rem; }
    .article-body h3 { font-size: 1.15rem; font-weight: 700; margin: 1.75rem 0 0.5rem; color: #111827; }
    .article-body ul, .article-body ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
    .article-body li { margin-bottom: 0.35rem; color: #374151; }
    .article-body blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; margin: 1.5rem 0; color: #6b7280; font-style: italic; }
    .article-body table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; font-size: 0.9rem; }
    .article-body th, .article-body td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
    .article-body th { background: #f9fafb; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .article-body a { color: #1d4ed8; }
    .article-body strong { font-weight: 700; }
    .article-body code { background: #f3f4f6; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.875em; }
    .site-footer { border-top: 1px solid #e5e7eb; padding: 1.5rem; text-align: center; font-size: 0.8rem; color: #9ca3af; }
  </style>
</head>
<body>
  <header class="site-header">
    <a class="logo" href="/">${escapeHtml(siteName)}</a>
    <nav>
      <a href="/">Home</a>
      <a href="/sitemap.xml">Sitemap</a>
    </nav>
  </header>
  <div class="article-wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a> &rsaquo; <span>${escapeHtml(page.title)}</span>
    </nav>
    <h1>${escapeHtml(page.title)}</h1>
    <div class="article-body">${page.body_html || ""}</div>
  </div>
  <footer class="site-footer">&copy; ${year} ${escapeHtml(siteName)}</footer>
</body>
</html>`;
}

function renderDisciplinePage(discipline, pages, siteName, gaId) {
  const year = new Date().getFullYear();
  const displayName = discipline
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const slug = discipline.replace(/ /g, "-");

  const cardHtml =
    pages.length === 0
      ? `<p style="color:var(--muted);text-align:center;padding:60px 0">No articles yet for this discipline — check back soon.</p>`
      : pages
          .map(
            (p, i) => `
      <article class="card fade-in" style="transition-delay:${i * 0.05}s">
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(displayName)} &mdash; ${escapeHtml(siteName)}</title>
  <meta name="description" content="All ${escapeHtml(displayName.toLowerCase())} articles on ${escapeHtml(siteName)}: guides, scoring breakdowns, skill analysis, and more.">
  <link rel="canonical" href="/discipline/${slug}">
  ${gaSnippet(gaId)}
  <style>
    ${BASE_CSS}
    .disc-header { padding: 80px 0 48px; border-bottom: 1px solid var(--border); }
    .disc-breadcrumb { font-size: 0.82rem; color: var(--muted); margin-bottom: 1.5rem; }
    .disc-breadcrumb a { color: var(--muted); text-decoration: none; }
    .disc-breadcrumb a:hover { color: var(--gold); }
    .disc-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px,6vw,72px); line-height: 1; margin-bottom: 12px; }
    .disc-count { font-size: 14px; color: var(--muted); }
    .disc-grid { padding: 60px 0 80px; }
    .articles-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
    @media (max-width: 1023px) { .articles-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 767px)  { .articles-grid { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
    .card:hover .card-img img { transform: scale(1.05); }
    .card-img { overflow: hidden; aspect-ratio: 16/9; }
    .card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
    .card-img-placeholder { display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .placeholder-icon { filter: opacity(0.3); }
    .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .card-title { font-family: 'Montserrat', sans-serif; font-size: 17px; font-weight: 800; line-height: 1.3; margin-bottom: 10px; color: var(--text); }
    .card-desc { font-size: 14px; color: var(--muted); flex: 1; }
    .card-footer-row { display: flex; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
    .card-link { color: var(--gold); font-size: 13px; font-weight: 700; text-decoration: none; }
    .card-link:hover { color: #ffd43b; }
  </style>
</head>
<body>
  ${navHtml(siteName)}
  <main>
    <section class="disc-header">
      <div class="container">
        <div class="disc-breadcrumb">
          <a href="/">Home</a> &rsaquo;
          <a href="/#disciplines">Disciplines</a> &rsaquo;
          ${escapeHtml(displayName)}
        </div>
        <h1 class="disc-title">${escapeHtml(displayName)}</h1>
        <p class="disc-count">${pages.length} article${pages.length !== 1 ? "s" : ""}</p>
      </div>
    </section>
    <section class="disc-grid">
      <div class="container">
        <div class="articles-grid">
          ${cardHtml}
        </div>
      </div>
    </section>
  </main>
  ${footerHtml(siteName, year)}
  ${PAGE_JS}
</body>
</html>`;
}

function renderSitemapIndex(langs, host) {
  const maps = langs
    .map(
      (l) => `  <sitemap><loc>https://${host}/sitemap-${l}.xml</loc></sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps}
</sitemapindex>`;
}

function renderLangSitemap(pages, lang, host) {
  const urls = pages
    .filter((p) => langFromSlug(p.slug) === lang)
    .map(
      (p) =>
        `  <url><loc>https://${host}/${escapeHtml(p.slug)}</loc><changefreq>monthly</changefreq></url>`,
    )
    .join("\n");
  const home =
    lang === "en"
      ? `  <url><loc>https://${host}/</loc><changefreq>weekly</changefreq></url>\n`
      : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${home}${urls}
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

const STATUS_COLORS = {
  published: "background:#dcfce7;color:#166534",
  draft: "background:#fef9c3;color:#854d0e",
  hidden: "background:#f3f4f6;color:#6b7280",
  deleted: "background:#fee2e2;color:#991b1b",
};

function statusBadge(status) {
  const s = status || "published";
  return `<span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:9999px;font-weight:600;${STATUS_COLORS[s] || ""}">${s}</span>`;
}

function renderAdminDashboard(counts, eventsTotal) {
  const statRows = ["published", "draft", "hidden", "deleted"]
    .map(
      (s) =>
        `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid #f3f4f6">
          ${statusBadge(s)}
          <strong>${counts[s] || 0}</strong>
        </div>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Dashboard</title>
  <style>${adminStyles()}</style>
</head>
<body>
  <div class="nav">
    <h1>Dashboard</h1>
    <form method="POST" action="/admin/logout" style="margin:0">
      <button class="btn btn-ghost" style="margin:0;padding:0.4rem 1rem;font-size:0.85rem" type="submit">Sign out</button>
    </form>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-bottom:1.5rem">
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem">
      <div style="font-size:0.75rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">Pages by status</div>
      ${statRows}
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0">
        <span style="font-size:0.8rem;color:#6b7280">Total</span>
        <strong>${Object.values(counts).reduce((a, b) => a + b, 0)}</strong>
      </div>
    </div>
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem">
      <div style="font-size:0.75rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">Events</div>
      <div style="font-size:2rem;font-weight:700;margin:0.5rem 0">${eventsTotal}</div>
      <a href="/admin/events" style="font-size:0.8rem;color:#1d4ed8">View all events →</a>
    </div>
  </div>
  <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
    <a class="btn" href="/admin/pages">All pages</a>
    <a class="btn btn-secondary" href="/admin/pages?status=draft">Review drafts</a>
    <a class="btn btn-secondary" href="/admin/new">+ Add page</a>
    <a class="btn btn-secondary" href="/admin/events">Events</a>
    <a class="btn btn-secondary" href="/admin/generate">Generate content</a>
  </div>
</body>
</html>`;
}

function renderAdminPages(pages, filters) {
  const { status = "", source = "", lang = "" } = filters || {};
  const qs = (overrides) => {
    const p = new URLSearchParams({
      ...(status ? { status } : {}),
      ...(source ? { source } : {}),
      ...(lang ? { lang } : {}),
      ...overrides,
    });
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const statuses = ["", "published", "draft", "hidden", "deleted"];
  const statusTabs = statuses
    .map((s) => {
      const active = s === status;
      return `<a href="/admin/pages${qs({ status: s })}" style="padding:0.35rem 0.75rem;border-radius:6px;font-size:0.8rem;font-weight:500;text-decoration:none;${active ? "background:#1d4ed8;color:#fff" : "color:#374151"}">${s || "All"}</a>`;
    })
    .join("");

  const rows = pages
    .map(
      (p) => `
    <tr>
      <td><a href="/admin/edit?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></td>
      <td><code style="font-size:0.75rem">/${escapeHtml(p.slug)}</code></td>
      <td><span class="tag">${escapeHtml(p.page_type || "")}</span></td>
      <td>${statusBadge(p.status)}</td>
      <td style="font-size:0.8rem;color:#6b7280">${escapeHtml(p.lang || "en")}</td>
      <td style="font-size:0.8rem;color:#6b7280">${escapeHtml(p.source || "")}</td>
      <td style="white-space:nowrap">
        <a href="/admin/edit?slug=${encodeURIComponent(p.slug)}" style="font-size:0.8rem">Edit</a>
        ${p.status !== "published" ? `<form method="POST" action="/admin/pages/status" style="display:inline;margin-left:0.5rem"><input type="hidden" name="slug" value="${escapeHtml(p.slug)}"><input type="hidden" name="status" value="published"><button type="submit" style="background:none;border:none;color:#16a34a;cursor:pointer;font-size:0.8rem;padding:0">Publish</button></form>` : ""}
        ${p.status !== "draft" ? `<form method="POST" action="/admin/pages/status" style="display:inline;margin-left:0.5rem"><input type="hidden" name="slug" value="${escapeHtml(p.slug)}"><input type="hidden" name="status" value="draft"><button type="submit" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:0.8rem;padding:0">Draft</button></form>` : ""}
        ${p.status !== "hidden" ? `<form method="POST" action="/admin/pages/status" style="display:inline;margin-left:0.5rem"><input type="hidden" name="slug" value="${escapeHtml(p.slug)}"><input type="hidden" name="status" value="hidden"><button type="submit" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:0.8rem;padding:0">Hide</button></form>` : ""}
      </td>
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
    <a class="btn btn-ghost" href="/admin" style="margin:0;padding:0.4rem 1rem;font-size:0.85rem">← Dashboard</a>
  </div>
  <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:1rem;background:#f9fafb;padding:0.5rem;border-radius:8px">
    ${statusTabs}
  </div>
  <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1rem">
    <a class="btn" href="/admin/new">+ Add page</a>
  </div>
  ${
    pages.length
      ? `<table>
    <thead><tr><th>Title</th><th>Slug</th><th>Type</th><th>Status</th><th>Lang</th><th>Source</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`
      : `<p style="color:#6b7280">No pages found.</p>`
  }
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

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:1rem">
      <div>
        <label for="status">Status</label>
        <select id="status" name="status">
          ${["draft", "published", "hidden", "deleted"].map((s) => `<option value="${s}"${(page?.status || "draft") === s ? " selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <div>
        <label for="template">Template</label>
        <select id="template" name="template">
          <option value="legacy"${(page?.template || "legacy") === "legacy" ? " selected" : ""}>legacy</option>
          <option value="flagship"${page?.template === "flagship" ? " selected" : ""}>flagship</option>
        </select>
      </div>
      <div>
        <label for="lang">Language</label>
        <select id="lang" name="lang">
          ${["en", "de", "fr", "es", "pt", "it", "nl", "ja", "zh"].map((l) => `<option value="${l}"${(page?.lang || "en") === l ? " selected" : ""}>${l}</option>`).join("")}
        </select>
      </div>
      <div>
        <label for="source">Source</label>
        <select id="source" name="source">
          ${["", "contentclaw", "gymbot", "manual"].map((s) => `<option value="${s}"${(page?.source || "") === s ? " selected" : ""}>${s || "—"}</option>`).join("")}
        </select>
      </div>
      <div>
        <label for="discipline">Discipline</label>
        <select id="discipline" name="discipline">
          ${["", "artistic gymnastics", "rhythmic gymnastics", "trampoline", "aerobic gymnastics", "acrobatic gymnastics", "parkour", "paragymnastics"].map((d) => `<option value="${d}"${(page?.discipline || "") === d ? " selected" : ""}>${d || "—"}</option>`).join("")}
        </select>
      </div>
    </div>

    <label for="body_html">Content (HTML)</label>
    <textarea id="body_html" name="body_html" required placeholder="<p>Your content here...</p>">${val("body_html")}</textarea>

    <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center">
      <button class="btn" type="submit">${isEdit ? "Save changes" : "Save page"}</button>
      <a class="btn btn-secondary" href="/admin/pages">Cancel</a>
    </div>
  </form>
</body>
</html>`;
}

function renderAdminEvents(events, year) {
  const yearOptions = [2024, 2025, 2026, 2027]
    .map(
      (y) =>
        `<option value="${y}"${y === year ? " selected" : ""}>${y}</option>`,
    )
    .join("");
  const rows = events
    .map((e) => {
      const discs = JSON.parse(e.disciplines || "[]").join(", ");
      const changed = e.change_flag
        ? '<span style="color:#e8005a;font-size:0.75rem">&#9679; changed</span>'
        : "";
      return `<tr>
      <td style="font-size:0.75rem;color:#6b7280">${escapeHtml(e.id)}</td>
      <td>${escapeHtml(e.title)}</td>
      <td>${escapeHtml(e.city)}</td>
      <td style="white-space:nowrap">${escapeHtml(e.dates)}</td>
      <td style="font-size:0.8rem">${escapeHtml(discs)}</td>
      <td>${e.year}</td>
      <td>${changed}</td>
      <td style="white-space:nowrap">
        <a href="/admin/events/${encodeURIComponent(e.id)}/edit" style="font-size:0.8rem">Edit</a>
        <form method="POST" action="/admin/events/${encodeURIComponent(e.id)}/delete" style="display:inline;margin-left:0.5rem" onsubmit="return confirm('Delete this event?')">
          <button type="submit" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:0.8rem;padding:0">Delete</button>
        </form>
      </td>
    </tr>`;
    })
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Events</title>
  <style>${adminStyles()}
    table { font-size: 0.82rem; }
  </style>
</head>
<body>
  <div class="nav">
    <h1>Events <span style="font-size:0.85rem;font-weight:400;color:#6b7280">(${events.length})</span></h1>
    <a class="btn btn-ghost" href="/admin" style="margin:0;padding:0.4rem 1rem;font-size:0.85rem">← Dashboard</a>
  </div>
  <div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1rem;flex-wrap:wrap">
    <form method="GET" action="/admin/events" style="display:flex;gap:0.5rem;align-items:center;margin:0">
      <label for="year" style="font-size:0.875rem;font-weight:500">Year</label>
      <select id="year" name="year" style="padding:0.35rem 0.6rem;border:1px solid #d1d5db;border-radius:6px;font-size:0.875rem">
        ${yearOptions}
      </select>
      <button class="btn btn-secondary" style="margin:0;padding:0.4rem 1rem;font-size:0.85rem" type="submit">Filter</button>
    </form>
    <a class="btn" href="/admin/events/new" style="margin:0">+ Add event</a>
  </div>
  ${
    events.length
      ? `<table>
    <thead><tr><th>ID</th><th>Title</th><th>City</th><th>Dates</th><th>Disciplines</th><th>Year</th><th></th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`
      : `<p style="color:#6b7280">No events found for ${year}. <a href="/admin/events/new">Add one</a>.</p>`
  }
</body>
</html>`;
}

function renderAdminEventForm(event, error) {
  const isEdit = !!event;
  const val = (f, fallback = "") =>
    event ? escapeHtml(String(event[f] ?? fallback)) : fallback;
  const disciplines = isEdit
    ? JSON.parse(event.disciplines || "[]").join(", ")
    : "";
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1]
    .map(
      (y) =>
        `<option value="${y}"${(event?.year ?? currentYear) == y ? " selected" : ""}>${y}</option>`,
    )
    .join("");
  const action = isEdit
    ? `/admin/events/${encodeURIComponent(event.id)}/edit`
    : "/admin/events/new";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEdit ? "Edit event" : "Add event"} — Admin</title>
  <style>${adminStyles()}</style>
</head>
<body>
  <div class="nav">
    <h1>${isEdit ? "Edit event" : "Add event"}</h1>
    <a class="btn btn-ghost" href="/admin/events" style="margin:0;padding:0.4rem 1rem;font-size:0.85rem">← Events</a>
  </div>
  ${error ? `<div style="background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;border-radius:8px;padding:1rem;margin-bottom:1rem">${escapeHtml(error)}</div>` : ""}
  <form method="POST" action="${action}">
    <label for="id">Event ID <span style="color:#6b7280;font-size:0.8rem">(unique, e.g. fig-wc-2026-paris-ag)</span></label>
    <input type="text" id="id" name="id" required value="${val("id")}"
      placeholder="fig-wc-2026-paris-ag"
      ${isEdit ? 'readonly style="background:#f3f4f6;color:#6b7280"' : ""}>
    ${isEdit ? '<p class="hint">ID cannot be changed after creation.</p>' : ""}

    <label for="title">Title</label>
    <input type="text" id="title" name="title" required value="${val("title")}"
      placeholder="World Artistic Gymnastics Championships">

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div>
        <label for="city">City</label>
        <input type="text" id="city" name="city" required value="${val("city")}" placeholder="Paris">
      </div>
      <div>
        <label for="year">Year</label>
        <select id="year" name="year">${yearOptions}</select>
      </div>
    </div>

    <label for="dates">Dates <span style="color:#6b7280;font-size:0.8rem">(e.g. 18–27 Oct 2026)</span></label>
    <input type="text" id="dates" name="dates" required value="${val("dates")}" placeholder="18–27 Oct 2026">

    <label for="disciplines">Disciplines <span style="color:#6b7280;font-size:0.8rem">(comma-separated)</span></label>
    <input type="text" id="disciplines" name="disciplines" value="${escapeHtml(disciplines)}"
      placeholder="Artistic Gymnastics, Rhythmic Gymnastics">

    <label style="display:flex;align-items:center;gap:0.5rem;font-weight:400;cursor:pointer">
      <input type="checkbox" name="change_flag" value="1"${event?.change_flag ? " checked" : ""}>
      Mark as changed
    </label>

    <div style="margin-top:1rem;display:flex;gap:0.75rem">
      <button class="btn" type="submit">${isEdit ? "Save changes" : "Add event"}</button>
      <a class="btn btn-secondary" href="/admin/events">Cancel</a>
    </div>
  </form>
</body>
</html>`;
}

function renderAdminGenerate({ error, success, keyword, pipeline } = {}) {
  const banner = error
    ? `<div class="flash flash-error">${escapeHtml(error)}</div>`
    : success
      ? `<div class="flash flash-ok">
           <strong>${pipeline === "gymbot" ? "Gymbot" : "ContentClaw"}</strong> workflow dispatched
           for <strong>${escapeHtml(keyword)}</strong>.
           It will appear in <a href="/admin/pages?status=draft">draft pages</a>
           once the run completes (${pipeline === "gymbot" ? "~3&ndash;8" : "~2&ndash;5"} min).
         </div>`
      : "";

  const PAGE_TYPES = [
    "auto",
    "blog",
    "hub",
    "how-to",
    "glossary",
    "comparison",
    "listicle",
    "review",
    "alternatives",
    "landing",
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Generate content</title>
  <style>
    ${adminStyles()}
    .flash { padding:0.75rem 1rem; border-radius:8px; margin-bottom:1.25rem; font-size:0.875rem; }
    .flash-ok    { background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; }
    .flash-error { background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; }
    .flash a { color:inherit; font-weight:600; }
    .hint { font-size:0.8rem; color:#6b7280; margin-top:0.25rem; }
    .section-sep { border:none; border-top:1px solid #e5e7eb; margin:1.5rem 0; }
    .pipeline-tabs { display:flex; gap:0; margin-bottom:1.5rem; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
    .pipeline-tab { flex:1; padding:0.6rem 1rem; font-size:0.875rem; font-weight:600; text-align:center;
      background:#f9fafb; border:none; cursor:pointer; transition:background 0.15s; }
    .pipeline-tab.active { background:#111827; color:#fff; }
    .pipeline-tab:first-child { border-right:1px solid #e5e7eb; }
    .pipeline-desc { font-size:0.8rem; color:#6b7280; margin-bottom:1.25rem; padding:0.6rem 0.75rem;
      background:#f9fafb; border-radius:6px; border:1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="nav">
    <h1>Generate content</h1>
    <a class="btn btn-ghost" href="/admin" style="margin:0;padding:0.4rem 1rem;font-size:0.85rem">← Dashboard</a>
  </div>
  ${banner}
  <div style="max-width:560px">
    <div class="pipeline-tabs">
      <button type="button" class="pipeline-tab active" id="tab-contentclaw" onclick="setPipeline('contentclaw')">ContentClaw</button>
      <button type="button" class="pipeline-tab" id="tab-gymbot" onclick="setPipeline('gymbot')">Gymbot</button>
    </div>

    <div id="desc-contentclaw" class="pipeline-desc">
      Bulk SEO content from a keyword or seeds CSV. Generates <strong>draft</strong> pages with <code>template=legacy</code>.
      Best for glossary, listicle, how-to, and long-tail blog posts.
    </div>
    <div id="desc-gymbot" class="pipeline-desc" style="display:none">
      Agentic flagship article — orchestrator → competition/athlete research → writer → editorial QA.
      Generates a single <strong>draft</strong> page with <code>template=flagship</code>.
      Best for event coverage and athlete profiles.
    </div>

    <form method="POST" action="/admin/generate">
      <input type="hidden" name="pipeline" id="pipeline-input" value="contentclaw">

      <!-- Gymbot -->
      <div id="section-gymbot" style="display:none">
        <label for="topic">Topic / query</label>
        <input type="text" id="topic" name="topic" placeholder="e.g. 2026 World Artistic Championships vault final" autocomplete="off">
        <p class="hint">Describe what you want covered — event, athlete, or angle.</p>
      </div>

      <!-- ContentClaw -->
      <div id="section-contentclaw">
        <label for="keyword">Keyword / topic</label>
        <input type="text" id="keyword" name="keyword" placeholder="e.g. Amanar vault explained" autocomplete="off">
        <p class="hint">Leave blank if using a seeds file.</p>

        <label for="page_type">Page type</label>
        <select id="page_type" name="page_type">
          ${PAGE_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")}
        </select>

        <hr class="section-sep">

        <label for="expand">Expand into N variations <span style="color:#9ca3af;font-weight:400">(optional)</span></label>
        <input type="number" id="expand" name="expand" min="2" max="50" placeholder="e.g. 8">
        <p class="hint">Generates N long-tail variants from the keyword above.</p>

        <label for="seeds_file">Seeds CSV path <span style="color:#9ca3af;font-weight:400">(optional — overrides keyword)</span></label>
        <input type="text" id="seeds_file" name="seeds_file" placeholder="seeds.csv">

        <label for="competitor">Competitor sitemap URL <span style="color:#9ca3af;font-weight:400">(optional)</span></label>
        <input type="url" id="competitor" name="competitor" placeholder="https://example.com/sitemap.xml">
      </div>

      <div style="display:flex;gap:0.75rem;margin-top:1.5rem">
        <button class="btn" type="submit">Dispatch workflow</button>
        <a class="btn btn-secondary" href="/admin">Cancel</a>
      </div>
    </form>
    <p style="margin-top:1.5rem;font-size:0.8rem;color:#9ca3af">
      Requires <code>GITHUB_TOKEN</code> Worker secret with <code>workflow</code> scope.
      Pages land as <strong>draft</strong> — review at
      <a href="/admin/pages?status=draft" style="color:#6b7280">/admin/pages?status=draft</a>.
    </p>
  </div>
  <script>
    function setPipeline(p) {
      document.getElementById('pipeline-input').value = p;
      document.getElementById('section-contentclaw').style.display = p === 'contentclaw' ? '' : 'none';
      document.getElementById('section-gymbot').style.display = p === 'gymbot' ? '' : 'none';
      document.getElementById('desc-contentclaw').style.display = p === 'contentclaw' ? '' : 'none';
      document.getElementById('desc-gymbot').style.display = p === 'gymbot' ? '' : 'none';
      document.getElementById('tab-contentclaw').classList.toggle('active', p === 'contentclaw');
      document.getElementById('tab-gymbot').classList.toggle('active', p === 'gymbot');
    }
  </script>
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

    // Admin — dashboard
    if (path === "/admin") {
      const { results: statusRows } = await env.DB.prepare(
        "SELECT status, COUNT(*) as n FROM pages GROUP BY status",
      ).all();
      const counts = Object.fromEntries(
        statusRows.map((r) => [r.status || "published", r.n]),
      );
      const eventsTotal =
        (await env.DB.prepare("SELECT COUNT(*) as n FROM events").first())?.n ??
        0;
      return new Response(renderAdminDashboard(counts, eventsTotal), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin — pages list (filterable)
    if (path === "/admin/pages") {
      const status = url.searchParams.get("status") || "";
      const source = url.searchParams.get("source") || "";
      const lang = url.searchParams.get("lang") || "";
      let query =
        "SELECT slug, title, page_type, status, source, lang FROM pages";
      const conditions = [];
      const binds = [];
      if (status) {
        conditions.push("status = ?");
        binds.push(status);
      }
      if (source) {
        conditions.push("source = ?");
        binds.push(source);
      }
      if (lang) {
        conditions.push("lang = ?");
        binds.push(lang);
      }
      if (conditions.length) query += " WHERE " + conditions.join(" AND ");
      query += " ORDER BY created_at DESC LIMIT 1000";
      const stmt = env.DB.prepare(query);
      const { results } = await (
        binds.length ? stmt.bind(...binds) : stmt
      ).all();
      return new Response(renderAdminPages(results, { status, source, lang }), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin — quick status change
    if (path === "/admin/pages/status" && request.method === "POST") {
      const formData = await request.formData();
      const slug = formData.get("slug")?.trim();
      const status = formData.get("status")?.trim();
      const validStatuses = ["draft", "published", "hidden", "deleted"];
      if (!slug || !validStatuses.includes(status)) {
        return new Response("Invalid request", { status: 400 });
      }
      await env.DB.prepare(
        "UPDATE pages SET status = ?, updated_at = datetime('now') WHERE slug = ?",
      )
        .bind(status, slug)
        .run();
      const ref = request.headers.get("Referer") || "/admin/pages";
      return redirect(ref);
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
      if (!slug) return redirect("/admin/pages");
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
      const status = ["draft", "published", "hidden", "deleted"].includes(
        formData.get("status"),
      )
        ? formData.get("status")
        : "draft";
      const lang = formData.get("lang")?.trim() || "en";
      const source = formData.get("source")?.trim() || null;
      const template =
        formData.get("template") === "flagship" ? "flagship" : "legacy";

      if (!slug || !/^(?:[a-z]{2}\/)?[a-z0-9-]{1,200}$/.test(slug)) {
        return new Response(
          "Invalid slug: use only lowercase letters, numbers, and hyphens. Language prefix allowed (e.g. de/slug)",
          { status: 400 },
        );
      }
      if (!title || !body_html) {
        return new Response("Missing required fields", { status: 400 });
      }

      const safe_body_html = body_html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
        .replace(/\bhref\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, "")
        .replace(/\bsrc\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, "");

      let image_url = formData.get("image_url")?.trim() || null;
      if (image_url) {
        try {
          if (new URL(image_url).protocol !== "https:") image_url = null;
        } catch {
          image_url = null;
        }
      }

      const discipline = formData.get("discipline")?.trim() || "";

      await env.DB.prepare(
        `INSERT OR REPLACE INTO pages
           (slug, title, meta_description, keyword, page_type, body_html, image_url, status, lang, source, template, discipline, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
        .bind(
          slug,
          title,
          meta_description,
          keyword,
          page_type,
          safe_body_html,
          image_url,
          status,
          lang,
          source,
          template,
          discipline,
        )
        .run();
      return redirect(`/admin/pages`);
    }

    // Admin — generate (GET form + POST dispatch)
    if (path === "/admin/generate") {
      if (request.method === "POST") {
        const formData = await request.formData();
        const pipeline = formData.get("pipeline")?.trim() || "contentclaw";
        const isGymbot = pipeline === "gymbot";

        const GITHUB_TOKEN = env.GITHUB_TOKEN;
        if (!GITHUB_TOKEN) {
          return new Response(
            renderAdminGenerate({
              error: "GITHUB_TOKEN secret is not configured on this Worker.",
            }),
            {
              headers: {
                "Content-Type": "text/html; charset=UTF-8",
                ...securityHeaders(true),
              },
            },
          );
        }

        let workflow, inputs, label;

        if (isGymbot) {
          const topic = formData.get("topic")?.trim() || "";
          if (!topic) {
            return new Response(
              renderAdminGenerate({ error: "Enter a topic for Gymbot." }),
              {
                headers: {
                  "Content-Type": "text/html; charset=UTF-8",
                  ...securityHeaders(true),
                },
              },
            );
          }
          workflow = "gymbot.yml";
          inputs = { topic };
          label = topic;
        } else {
          const keyword = formData.get("keyword")?.trim() || "";
          const seeds_file = formData.get("seeds_file")?.trim() || "";
          if (!keyword && !seeds_file) {
            return new Response(
              renderAdminGenerate({
                error: "Enter a keyword or a seeds file path.",
              }),
              {
                headers: {
                  "Content-Type": "text/html; charset=UTF-8",
                  ...securityHeaders(true),
                },
              },
            );
          }
          workflow = "generate.yml";
          inputs = {
            keyword,
            page_type: formData.get("page_type")?.trim() || "auto",
            expand: formData.get("expand")?.trim() || "",
            seeds_file,
            competitor: formData.get("competitor")?.trim() || "",
          };
          label = keyword || seeds_file;
        }

        let dispatchError = null;
        try {
          const resp = await fetch(
            `https://api.github.com/repos/onepau/gymtastic/actions/workflows/${workflow}/dispatches`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "gymtastic-worker",
              },
              body: JSON.stringify({ ref: "main", inputs }),
            },
          );
          if (!resp.ok) {
            const body = await resp.text();
            dispatchError = `GitHub API ${resp.status}: ${body.slice(0, 200)}`;
          }
        } catch (err) {
          dispatchError = `Network error: ${err.message}`;
        }

        const html = dispatchError
          ? renderAdminGenerate({ error: dispatchError })
          : renderAdminGenerate({ success: true, keyword: label, pipeline });
        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=UTF-8",
            ...securityHeaders(true),
          },
        });
      }

      return new Response(renderAdminGenerate(), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin — events list
    if (path === "/admin/events") {
      const year =
        parseInt(url.searchParams.get("year") || "") ||
        new Date().getFullYear();
      const { results } = await env.DB.prepare(
        "SELECT * FROM events WHERE year = ? ORDER BY dates",
      )
        .bind(year)
        .all();
      return new Response(renderAdminEvents(results, year), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin — new event form
    if (path === "/admin/events/new") {
      if (request.method === "POST") {
        const formData = await request.formData();
        const id = formData.get("id")?.trim();
        const title = formData.get("title")?.trim();
        const city = formData.get("city")?.trim() || "";
        const dates = formData.get("dates")?.trim() || "";
        const year =
          parseInt(formData.get("year") || "") || new Date().getFullYear();
        const disciplinesRaw = formData.get("disciplines")?.trim() || "";
        const disciplines = disciplinesRaw
          ? disciplinesRaw
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean)
          : [];
        const change_flag = formData.get("change_flag") === "1" ? 1 : 0;

        if (!id || !title) {
          return new Response(
            renderAdminEventForm(
              {
                id,
                title,
                city,
                dates,
                year,
                disciplines: JSON.stringify(disciplines),
                change_flag,
              },
              "ID and title are required.",
            ),
            {
              headers: {
                "Content-Type": "text/html; charset=UTF-8",
                ...securityHeaders(true),
              },
            },
          );
        }
        await env.DB.prepare(
          `INSERT INTO events (id, title, city, dates, disciplines, year, change_flag, synced_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        )
          .bind(
            id,
            title,
            city,
            dates,
            JSON.stringify(disciplines),
            year,
            change_flag,
          )
          .run();
        return redirect(`/admin/events?year=${year}`);
      }
      return new Response(renderAdminEventForm(null), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Admin — edit / delete event (path: /admin/events/:id/edit or /delete)
    const eventEditMatch = path.match(
      /^\/admin\/events\/([^/]+)\/(edit|delete)$/,
    );
    if (eventEditMatch) {
      const eventId = decodeURIComponent(eventEditMatch[1]);
      const action = eventEditMatch[2];

      if (action === "delete" && request.method === "POST") {
        const event = await env.DB.prepare(
          "SELECT year FROM events WHERE id = ?",
        )
          .bind(eventId)
          .first();
        await env.DB.prepare("DELETE FROM events WHERE id = ?")
          .bind(eventId)
          .run();
        return redirect(
          `/admin/events?year=${event?.year || new Date().getFullYear()}`,
        );
      }

      const event = await env.DB.prepare("SELECT * FROM events WHERE id = ?")
        .bind(eventId)
        .first();
      if (!event) return new Response("Event not found", { status: 404 });

      if (action === "edit" && request.method === "POST") {
        const formData = await request.formData();
        const title = formData.get("title")?.trim();
        const city = formData.get("city")?.trim() || "";
        const dates = formData.get("dates")?.trim() || "";
        const year =
          parseInt(formData.get("year") || "") || new Date().getFullYear();
        const disciplinesRaw = formData.get("disciplines")?.trim() || "";
        const disciplines = disciplinesRaw
          ? disciplinesRaw
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean)
          : [];
        const change_flag = formData.get("change_flag") === "1" ? 1 : 0;

        if (!title) {
          return new Response(
            renderAdminEventForm(
              {
                ...event,
                title,
                city,
                dates,
                year,
                disciplines: JSON.stringify(disciplines),
                change_flag,
              },
              "Title is required.",
            ),
            {
              headers: {
                "Content-Type": "text/html; charset=UTF-8",
                ...securityHeaders(true),
              },
            },
          );
        }
        await env.DB.prepare(
          `UPDATE events SET title=?, city=?, dates=?, disciplines=?, year=?, change_flag=?, synced_at=datetime('now') WHERE id=?`,
        )
          .bind(
            title,
            city,
            dates,
            JSON.stringify(disciplines),
            year,
            change_flag,
            eventId,
          )
          .run();
        return redirect(`/admin/events?year=${year}`);
      }

      return new Response(renderAdminEventForm(event), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          ...securityHeaders(true),
        },
      });
    }

    // Sitemap
    // Sitemap index
    if (path === "/sitemap.xml") {
      const { results } = await env.DB.prepare(
        "SELECT slug FROM pages WHERE status = 'published' ORDER BY id LIMIT 50000",
      ).all();
      const langs = [...new Set(results.map((p) => langFromSlug(p.slug)))];
      if (langs.length === 0) langs.push("en");
      return new Response(renderSitemapIndex(langs, url.host), {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Per-language sitemaps: /sitemap-en.xml, /sitemap-de.xml, etc.
    const langSitemapMatch = path.match(/^\/sitemap-([a-z]{2})\.xml$/);
    if (langSitemapMatch) {
      const lang = langSitemapMatch[1];
      const { results } = await env.DB.prepare(
        "SELECT slug FROM pages WHERE status = 'published' ORDER BY id LIMIT 50000",
      ).all();
      return new Response(renderLangSitemap(results, lang, url.host), {
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
        "SELECT slug, title, page_type, meta_description, image_url FROM pages WHERE status = 'published' ORDER BY page_type, title LIMIT 500",
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

    // Discipline listing pages: /discipline/artistic-gymnastics
    const disciplineMatch = path.match(/^\/discipline\/([a-z0-9-]+)$/);
    if (disciplineMatch) {
      const discipline = disciplineMatch[1].replace(/-/g, " ");
      const VALID_DISCIPLINES = [
        "artistic gymnastics",
        "rhythmic gymnastics",
        "trampoline",
        "aerobic gymnastics",
        "acrobatic gymnastics",
        "parkour",
        "paragymnastics",
      ];
      if (!VALID_DISCIPLINES.includes(discipline)) {
        return new Response("Not found", { status: 404 });
      }
      const { results } = await env.DB.prepare(
        "SELECT slug, title, page_type, meta_description, image_url FROM pages WHERE discipline = ? AND status = 'published' ORDER BY title",
      )
        .bind(discipline)
        .all();
      return new Response(
        renderDisciplinePage(discipline, results, env.SITE_NAME, GA_ID),
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
    let page = await env.DB.prepare(
      "SELECT * FROM pages WHERE slug = ? AND status = 'published'",
    )
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

    const html =
      page.template === "flagship"
        ? renderPage(page, env.SITE_NAME, env.SITE_DESCRIPTION, GA_ID)
        : renderLegacyPage(page, env.SITE_NAME, GA_ID);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "public, max-age=3600",
        "X-Robots-Tag": "index, follow",
        ...securityHeaders(),
      },
    });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      env.DB.prepare(
        "DELETE FROM analytics WHERE visited_at < datetime('now', '-90 days')",
      ).run(),
    );
  },
};
