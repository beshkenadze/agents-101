# Agents 101

Talk slides: **From a simple API call to a working AI agent — step by step.**

Stack: TypeScript, Vercel AI SDK, Mastra. Built with [Slidev](https://sli.dev).

## Run locally

```bash
bun install
bun run dev        # live reload at http://localhost:3030
```

Press `p` to open presenter mode (slide + next preview + speaker notes + timer).

## Export

```bash
bun run build          # static build in ./dist
bun run export         # PDF (requires playwright-chromium)
bun run export:notes   # speaker notes as a separate PDF
```

## Structure

- `slides.md` — all 15 slides plus speaker notes
- `style.css` — design tokens (colors, fonts, layout classes)
- `slide-top.vue` / `slide-bottom.vue` — terminal chrome, reads `path` / `meta` / `status` from per-slide frontmatter
- `layouts/split.vue` — header + two-column layout for code + text slides

## Sync between speech and slide

Slidev ships three layers:

1. **Presenter mode** (press `p` or go to `/presenter`) — current slide on the left, speaker notes and next-slide preview on the right, timer on top.
2. **Click markers** — `[click]` in speaker notes. Combined with `v-click` directives on slide elements, the right note gets highlighted as you press space.
3. **Recording** — `slidev export --with-clicks` can render a full video with webcam.

See [sli.dev/features/click-marker](https://sli.dev/features/click-marker).
