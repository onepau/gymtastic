// Cloudflare Vectorize (v2) + Workers AI embeddings via REST API.
//
// Before first use, create the index once:
//   npx wrangler vectorize create gymtastic-kb --dimensions=384 --metric=cosine
//
// The API token needs Workers AI (run) + Vectorize (edit) permissions.

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const INDEX_NAME = "gymtastic-kb";
const EMBEDDING_MODEL = "@cf/baai/bge-small-en-v1.5"; // 384-dim, cosine
const MIN_SCORE = 0.7;
const MAX_METADATA_CHARS = 8000;

function cfHeaders() {
  return {
    Authorization: `Bearer ${CF_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function slugId(prefix: string, text: string): string {
  return `${prefix}:${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)}`;
}

async function embed(text: string): Promise<number[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${EMBEDDING_MODEL}`,
    {
      method: "POST",
      headers: cfHeaders(),
      body: JSON.stringify({ text }),
    },
  );
  const body = (await res.json()) as {
    result: { data: number[][] };
    success: boolean;
    errors: { message: string }[];
  };
  if (!body.success) {
    throw new Error(
      `Embedding failed: ${body.errors.map((e) => e.message).join(", ")}`,
    );
  }
  return body.result.data[0];
}

// Search the vector store. Returns a JSON string the agent can read directly.
export async function vectorSearch(query: string, topK = 5): Promise<string> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return "Vector store not configured.";
  try {
    const vector = await embed(query);
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/vectorize/v2/indexes/${INDEX_NAME}/query`,
      {
        method: "POST",
        headers: cfHeaders(),
        body: JSON.stringify({
          vector,
          topK,
          returnMetadata: "all",
          returnValues: false,
        }),
      },
    );
    const body = (await res.json()) as {
      result: {
        matches: {
          id: string;
          score: number;
          metadata: Record<string, string>;
        }[];
      };
      success: boolean;
    };
    if (!body.success) return "Vector store query failed.";
    const hits = body.result.matches.filter((m) => m.score >= MIN_SCORE);
    if (!hits.length) return "No relevant records found.";
    return JSON.stringify(
      hits.map((m) => ({
        score: Math.round(m.score * 1000) / 1000,
        type: m.metadata.type,
        query: m.metadata.query,
        retrieved_at: m.metadata.retrieved_at,
        content: m.metadata.content,
      })),
    );
  } catch {
    return "Vector store unavailable.";
  }
}

// Embed text and upsert into the index. Fire-and-forget safe — caller should catch errors.
export async function vectorUpsert(
  prefix: "athlete" | "competition",
  query: string,
  content: string,
): Promise<void> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return;
  const id = slugId(prefix, query);
  const vector = await embed(content.slice(0, 4000)); // embed first 4k chars
  const metadata: Record<string, string> = {
    type: prefix === "athlete" ? "athlete_data" : "competition_results",
    query,
    content: content.slice(0, MAX_METADATA_CHARS),
    retrieved_at: new Date().toISOString(),
  };
  // Vectorize v2 upsert expects NDJSON (application/x-ndjson), one vector per line
  const ndjson = JSON.stringify({ id, values: vector, metadata });
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/vectorize/v2/indexes/${INDEX_NAME}/upsert`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/x-ndjson",
      },
      body: ndjson,
    },
  );
}
