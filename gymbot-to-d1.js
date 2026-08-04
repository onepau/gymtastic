const fs = require("fs");

const raw = fs.readFileSync("gymbot-output.json", "utf8");
const output = JSON.parse(raw);

if (!output.title || !output.body_html) {
  console.error("Gymbot output missing required fields (title / body_html).");
  if (output.output_text) {
    console.error("QA output:\n", output.output_text.slice(0, 1000));
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

// Extract bullet-point corrections from QA output text.
function parseCorrections(qaText) {
  if (!qaText) return [];
  return (qaText.match(/^[\-\*•]\s+.+/gm) || []).map((l) =>
    l.replace(/^[\-\*•]\s+/, "").trim(),
  );
}

// Wrap quoted phrases mentioned in corrections with <mark> + inline annotation.
function annotateHtml(bodyHtml, corrections) {
  let html = bodyHtml;
  for (const correction of corrections) {
    // Find all double-quoted spans in the correction text.
    const quotes = [...correction.matchAll(/"([^"]{4,120})"/g)].map(
      (m) => m[1],
    );
    for (const phrase of quotes) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const noteAttr = correction.replace(/"/g, "&quot;").replace(/</g, "&lt;");
      html = html.replace(
        new RegExp(escaped, "g"),
        `<mark class="qa-flag" style="background:#fef08a;outline:2px solid #eab308;border-radius:2px;cursor:help" title="${noteAttr}">${phrase}</mark>`,
      );
    }
  }
  return html;
}

function buildQaBanner(corrections, qaText) {
  const items = corrections.length
    ? corrections
        .map(
          (c) => `<li style="margin:0.4rem 0">${c.replace(/</g, "&lt;")}</li>`,
        )
        .join("")
    : `<li style="margin:0.4rem 0">${(qaText || "").slice(0, 800).replace(/</g, "&lt;").replace(/\n/g, "<br>")}</li>`;

  return `<div class="qa-review-banner" style="background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-family:sans-serif">
  <p style="margin:0 0 0.5rem;font-weight:700;color:#92400e;font-size:0.95rem">⚠ QA Review Required — this draft was not approved for publication</p>
  <ul style="margin:0;padding-left:1.25rem;color:#78350f;font-size:0.875rem">
${items}
  </ul>
</div>`;
}

const approved = output.qa_approved === true;
const qaText = output.output_text || "";
const corrections = approved ? [] : parseCorrections(qaText);

let bodyHtml = output.body_html;

if (!approved) {
  bodyHtml =
    buildQaBanner(corrections, qaText) + annotateHtml(bodyHtml, corrections);
}

const slug = sqlStr(toSlug(output.title));
const title = sqlStr(output.title);
const meta = sqlStr(output.meta_description || "");
const body = sqlStr(bodyHtml);
const source = approved ? "gymbot" : "gymbot-rejected";

const sql = `INSERT OR IGNORE INTO pages (slug, title, meta_description, body_html, status, template, source, lang) VALUES (${slug}, ${title}, ${meta}, ${body}, 'draft', 'flagship', ${sqlStr(source)}, 'en');\n`;

fs.writeFileSync("import-gymbot.sql", sql);
console.log(
  `Written gymbot article (${approved ? "approved" : "QA REJECTED — review required"}): "${output.title}" → slug: ${toSlug(output.title)}`,
);
