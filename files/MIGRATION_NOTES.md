# Gymbot: OpenAI Agent Builder → Claude migration notes

## Fix before anything else

The 05 Image embedding agent's instructions contain a hardcoded PhotoShelter username and
plaintext password. Rotate that password immediately, then never put credentials in a
prompt again — prompts are logged and shipped to the model provider as plain text. Use
environment variables or a secrets manager instead.

## What's ported, what needs your input

**Ported and working from your exported instructions verbatim:**
- Guardrail input screening (rebuilt on Claude — see caveat below, this one needs testing)
- The four classification nodes and the branching logic that connects them
- 0 Orchestrator, 02 Competition results, 03 Athlete data, 08 Editorial QA
- The fallback agent

**Needs your input:**
- **06 Article writing agent** — exported with empty instructions. I've left a `TODO`
  placeholder in `src/agents.ts`. Send me the real system prompt and I'll drop it in.
- **05 Image embedding agent** — not ported as an agent at all, see below.
- **01a/01b event discovery agents** and the **04 audio transcription** agent your
  orchestrator's instructions reference aren't called anywhere in the exported
  `runWorkflow`, so I left them out. Let me know if they're wired in elsewhere and need
  porting too.
- **03 Athlete data agent's tools** — its instructions describe detailed web search
  domain restrictions, but the exported `tools` array only lists `fileSearch`, no web
  tool. Either the export missed a node setting, or web search was never actually wired
  in on the OpenAI side. I've added Claude's web search tool with the domain allow-list
  your instructions describe, since that matches evident intent — worth double-checking
  against the original.

## Architecture decisions

**Classifiers use the plain Anthropic API, not an agent loop.** Your four classify nodes
are single-turn, no tools, schema-constrained — that's a Messages API call with
structured outputs, not something that benefits from an autonomous agent. I used
Claude's GA structured outputs (`output_config.format`), which guarantees valid JSON
matching your existing schemas, same job your zod output types were doing.

**Tool-using nodes also use the plain API with a manual tool loop** (`src/anthropicAgent.ts`),
rather than the Claude Agent SDK. The Agent SDK is built around Claude Code's tool set
(bash, file edit, etc.) for coding-style autonomous work; your nodes are fixed,
per-node toolsets doing business-workflow tasks, which maps more directly onto explicit
tool arrays on the Messages API. This also avoids guessing at Agent SDK option names I
couldn't verify precisely for domain-restricted search.

**Domain-restricted search → native `web_search` tool.** Claude's web search tool takes
an `allowed_domains` parameter directly — no custom tool needed, which is simpler than
the OpenAI setup.

**File search / vector store needs a decision from you.** Your `fileSearch` tool points
at an OpenAI vector store (`vs_693ef1...`). Claude has no equivalent hosted vector store
product, so:
1. **Lower effort (what I built):** keep the OpenAI vector store as a pure retrieval
   service, called from a custom Claude tool. Your indexed documents stay put.
2. **Bigger lift:** re-index elsewhere (Cloudflare Vectorize is worth a look given you're
   already on Workers for other projects) if you'd rather not depend on OpenAI at all.

**Guardrails were rebuilt, not ported — test this one carefully.** There's no
Anthropic-branded equivalent to `@openai/guardrails`. `src/guardrails.ts` recreates your
six checks (PII masking, moderation categories, jailbreak, NSFW, URL filtering, prompt
injection) as a single structured-output call to Claude Haiku. This is a good-faith
first draft, not a certified product — run it against whatever adversarial inputs you
were catching before trusting it in production.

**05 Image embedding agent isn't a good fit for an LLM agent at all.** Logging into a
photo library, searching, and extracting an embed URL is deterministic browser
automation — an LLM's judgement only matters for picking which photo looks most
relevant. I'd build this as a small Playwright script (login, search, extract) that
Claude calls as a single structured tool, rather than having an agent drive a browser
turn by turn. Cheaper, faster, and keeps credentials out of any model context entirely.
Happy to build that once the password's rotated — just say the word.

## Not done

- 04 audio transcription — no agent existed in your export to port
- The 05 image step is missing from the "Specific event" branch in `workflow.ts` on
  purpose — see above
