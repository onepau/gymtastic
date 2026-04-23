const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'contentclaw.db'), { readonly: true });

const pages = db.prepare(`
  SELECT slug, title, meta_description, body as body_html, page_type, keyword
  FROM pages
  WHERE body IS NOT NULL
`).all();

console.log(`Found ${pages.length} pages to export`);

function sqlStr(str) {
  if (!str) return "''";
  // Only escape single quotes — leave everything else untouched
  return "'" + str.replace(/'/g, "''") + "'";
}

const lines = pages.map(page => {
  const slug = sqlStr(page.slug);
  const title = sqlStr(page.title);
  const meta = sqlStr(page.meta_description);
  const body = sqlStr(page.body_html);
  const type = sqlStr(page.page_type);
  const keyword = sqlStr(page.keyword);

  return `INSERT OR IGNORE INTO pages (slug, title, meta_description, body_html, page_type, keyword) VALUES (${slug}, ${title}, ${meta}, ${body}, ${type}, ${keyword});`;
});

fs.writeFileSync('import-pages.sql', lines.join('\n'));
console.log(`Written ${lines.length} INSERT statements to import-pages.sql`);

db.close();