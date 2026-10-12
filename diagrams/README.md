# Slide diagrams

Diagram sources for the deck, made with [archify](https://github.com/tt-a1i/archify).
The slides use the SVGs in `../public/diagrams/`, not these files directly.

| Source | Slide |
|---|---|
| `completion-workflow.workflow.json` | Completion shines inside a workflow |
| `agent-loop.workflow.json` | When steps aren't known up front |
| `tool-call.sequence.json` | A tool call is structured output + execute |
| `workflow-mini.workflow.json`, `agent-mini.workflow.json` | Workflow vs agent |
| `supervisor` / `swarm` / `router` `.architecture.json` | Three ways to compose |
| `demo-architecture.architecture.json` | One chat, two backends |

## Regenerate

1. Install archify (`npx skills add tt-a1i/archify -g`, or clone the repo).
2. For each changed source, run archify's checks and render the HTML:

   ```bash
   node <archify>/bin/archify.mjs finalize <type> <slug>.<type>.json <slug>.html --quality showcase
   ```

3. Turn the HTML into slide SVGs (needs `playwright` and a Chromium):

   ```bash
   node export.mjs path/to/<slug>.html ...
   ```

   `export.mjs` calls archify's own SVG export in dark mode, then
   `slide-theme.mjs` re-skins it to the deck palette (from `../style.css`),
   removes workflow swimlanes, and crops the canvas to the drawn content.

Every source sets `meta.legend.mode = "hidden"`: the slide text explains the
colors, so the legend would only take space.
