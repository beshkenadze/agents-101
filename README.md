# Agents 101

**From a simple API call to a working AI agent — step by step.**

Code and slides from my talk at HelsinkiJS. The demo is a chat that turns a
free-text description of your experience into a CV (PDF). It has **two
backends** for the same task, so you can compare them side by side:

- **Workflow** — fixed steps that you write in code.
- **Agent** — a model with tools in a loop. It decides the steps itself.

Stack: TypeScript, [Vercel AI SDK](https://ai-sdk.dev/docs), [Mastra](https://mastra.ai/docs), Next.js.

## Run the demo

You need Node.js 22.13+, [Bun](https://bun.sh) and an OpenAI API key.

```bash
cd demo
bun install
cp .env.example .env.local   # add your OPENAI_API_KEY
bun run dev                  # http://localhost:3000
```

`FIRECRAWL_API_KEY` is optional. Without it the agent's web search tool returns
no results, and everything else works.

Click the **mode** badge at the top of the chat to switch between **agent**
(the default) and **workflow**. The badge locks after the first message, because
one conversation uses one backend. Press **⌘K** (Ctrl+K) to start a new
conversation.

The chip above the input sends a sample message in one click. In the first one,
the consultant job has no company, so you can see how each backend asks for it.
The next chip answers the question. After "Yes", you get the CV as a PDF.

### Production build

`bun run dev` compiles each page on its first request. For a talk or a demo,
a production build is faster:

```bash
cd demo
bun install
bun run build                # type-checks and builds into .next/
bun run start                # http://localhost:3000
bun run start -- -p 3001     # if port 3000 is busy (e.g. dev is running)
```

`next start` reads the same `.env.local`. Where the data lives:

- conversations and working memory: `mastra.db` (SQLite through libsql; set
  `MASTRA_DB_URL` to use another file or a hosted libsql/Turso database);
- generated PDFs: the system temp folder (`agents-101-cvs/`), served at
  `/api/cvs/<id>.pdf`;
- workflow drafts: in the server's memory (they reset on restart).

So this setup is for one Node process: your laptop or one server. For
serverless hosting (for example Vercel) you would need a hosted database, shared
file storage for the PDFs, and a shared store for workflow drafts.

## Where to look

| What | File |
|---|---|
| Structured output: one `generateText` call with `Output.object` | [`demo/src/lib/extract.ts`](demo/src/lib/extract.ts) |
| Zod schemas (CV, draft, UI specs) | [`demo/src/lib/schemas.ts`](demo/src/lib/schemas.ts) |
| **Workflow** backend: extract → merge → validate → branch | [`demo/src/lib/workflows/cv-workflow.ts`](demo/src/lib/workflows/cv-workflow.ts) |
| **Agent** backend: instructions, tools, memory | [`demo/src/lib/agents/cv-agent.ts`](demo/src/lib/agents/cv-agent.ts) |
| Tools the agent can call | [`demo/src/lib/tools/`](demo/src/lib/tools/) |
| Working memory with a Zod schema | [`demo/src/lib/memory.ts`](demo/src/lib/memory.ts) |
| API route that picks the backend | [`demo/src/app/api/chat/route.ts`](demo/src/app/api/chat/route.ts) |
| React components rendered from tool output | [`demo/src/lib/ui/`](demo/src/lib/ui/), [`demo/src/components/`](demo/src/components/) |

## Learn more

- [AI SDK docs](https://ai-sdk.dev/docs) — `generateText`, structured output, tools
- [Mastra docs](https://mastra.ai/docs) — agents, workflows, memory
- [Slides](https://beshkenadze.github.io/agents-101/) — the talk itself
- [`agents-101.md`](agents-101.md) — every slide with its speaker notes, as plain text

---

## Slides

The slides are built with [Slidev](https://sli.dev).

```bash
bun install
bun run dev            # http://localhost:3030, press `p` for presenter mode
bun run build          # static build in ./dist
bun run export         # PDF (requires playwright-chromium)
bun run export:md      # regenerate agents-101.md
```

- `slides.md` — all slides and speaker notes (the source of truth)
- `agents-101.md` — readable export: slide text, notes, timing, version
- `diagrams/` — diagram sources ([archify](https://github.com/tt-a1i/archify)); SVGs in `public/diagrams/`
- `style.css` — design tokens (colors, fonts, layout classes)
- `slide-top.vue` / `slide-bottom.vue`, `layouts/split.vue` — slide chrome and layouts

In presenter mode, each `[click]` in the speaker notes is highlighted when you
press space. Lines like `>>> LIVE: … <<<` are stage directions for the demo,
not text to read.
