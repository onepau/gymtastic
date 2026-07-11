const fs = require("fs");

const raw = fs.readFileSync("gymbot-output.json", "utf8");
const output = JSON.parse(raw);

if (!output.qa_approved || !output.title || !output.body_html) {
  console.error("Gymbot output not approved or missing required fields.");
  if (output.output_text) {
    console.error("QA feedback:\n", output.output_text.slice(0, 1000));
  }
  process.exit(1);
}

function sqlStr(str) {
  if (!str) return "''";
  if (str.includes("\0")) throw new Error("NUL byte in value");
  return "'" + str.replace(/'/g, "''") + "'";
}

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const slug = sqlStr(toSlug(output.title));
const title = sqlStr(output.title);
const meta = sqlStr(output.meta_description || "");
const body = sqlStr(output.body_html);

const sql = `INSERT OR IGNORE INTO pages (slug, title, meta_description, body_html, status, template, source, lang) VALUES (${slug}, ${title}, ${meta}, ${body}, 'draft', 'flagship', 'gymbot', 'en');\n`;

fs.writeFileSync("import-gymbot.sql", sql);
console.log(
  `Written gymbot article: "${output.title}" → slug: ${toSlug(output.title)}`,
);
