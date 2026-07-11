const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const offsetIdx = args.indexOf("--offset");
const langIdx = args.indexOf("--lang");
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null;
const offset = offsetIdx !== -1 ? parseInt(args[offsetIdx + 1], 10) : 0;
const lang = langIdx !== -1 ? args[langIdx + 1] : null;

const db = new Database(path.join(__dirname, "contentclaw.db"), {
  readonly: true,
});

// When --lang is set, filter to pages whose keyword ends with " auf Deutsch" (or other lang suffix)
const langSuffix = lang
  ? ` auf ${lang === "de" ? "Deutsch" : lang.toUpperCase()}`
  : null;
const langFilter = langSuffix
  ? `AND keyword LIKE '%${langSuffix}'`
  : "AND keyword NOT LIKE '% auf %'";

const total = db
  .prepare(
    `SELECT COUNT(*) as n FROM pages WHERE body IS NOT NULL ${langFilter}`,
  )
  .get().n;

const query =
  limit != null
    ? `SELECT slug, title, meta_description, body as body_html, page_type, keyword
       FROM pages WHERE body IS NOT NULL ${langFilter} ORDER BY id LIMIT ${limit} OFFSET ${offset}`
    : `SELECT slug, title, meta_description, body as body_html, page_type, keyword
       FROM pages WHERE body IS NOT NULL ${langFilter} ORDER BY id`;

const pages = db.prepare(query).all();

console.log(
  `Exporting ${pages.length} of ${total} pages (offset ${offset})${limit != null ? ` — next batch: --offset ${offset + pages.length}` : ""}`,
);

function sqlStr(str) {
  if (!str) return "''";
  // Reject NUL bytes — they truncate strings silently in SQLite
  if (str.includes("\0"))
    throw new Error(`NUL byte in value: ${str.slice(0, 40)}`);
  // Doubling single quotes is correct SQLite string escaping
  return "'" + str.replace(/'/g, "''") + "'";
}

const lines = pages.map((page) => {
  // Rewrite lang-suffixed slugs (e.g. "some-slug-auf-deutsch") → "de/some-slug"
  let rawSlug = page.slug;
  if (lang && langSuffix) {
    const suffix = "-" + langSuffix.trim().toLowerCase().replace(/\s+/g, "-");
    if (rawSlug.endsWith(suffix))
      rawSlug = lang + "/" + rawSlug.slice(0, -suffix.length);
    else rawSlug = lang + "/" + rawSlug;
  }
  const slug = sqlStr(rawSlug);
  const title = sqlStr(page.title);
  const meta = sqlStr(page.meta_description);
  const body = sqlStr(page.body_html);
  const type = sqlStr(page.page_type);
  const keyword = sqlStr(page.keyword);

  return `INSERT OR IGNORE INTO pages (slug, title, meta_description, body_html, page_type, keyword, status, template, source, lang) VALUES (${slug}, ${title}, ${meta}, ${body}, ${type}, ${keyword}, 'draft', 'legacy', 'contentclaw', 'en');`;
});

fs.writeFileSync("import-pages.sql", lines.join("\n"));
console.log(`Written ${lines.length} INSERT statements to import-pages.sql`);

db.close();
