# Agents 101

> From a simple API call to a working AI agent — step by step.

| | |
|---|---|
| **Version** | `2026.10.14-01a69d6` |
| **State** | Branch `talk-texts`, **not merged to `main` yet** — the published deck is older. |
| **Format** | 20 min · live demo · 19 slides |
| **Speaker notes** | 1675 words ≈ 14:01 at 120 wpm (budget 19 min) |
| **Slides** | https://beshkenadze.github.io/agents-101/ |
| **Code** | https://github.com/beshkenadze/agents-101 |

*Generated from `slides.md` by `bun run export:md`. Edit the slides, not this file.*

## Timing

Notes only — clicks, pauses and the live demo add time on top.

| Section | Slides | Notes | Budget |
|---|---|---|---|
| 00 · Intro & agenda | 1–2 | 1:16 ⚠️ | 1:00 |
| 01 · Completion vs. agents | 3–6 | 2:49 | 3:00 |
| 02 · Structured output & tools | 7–9 | 2:47 | 4:00 |
| 03 · Workflow vs. agent · orchestration | 10–11 | 1:32 | 2:00 |
| 04 · Live demo — CV generator | 12–18 | 4:57 | 8:00 |
| end · Wrap-up | 19–19 | 0:40 | 1:00 |
| **Total** | 1–19 | **14:01** | **19:00** |

## Slides

- [01 · Agents 101](#slide-1)
- [02 · Agenda](#slide-2)
- [03 · Completion](#slide-3)
- [04 · Completion in workflow](#slide-4)
- [05 · When you need an agent](#slide-5)
- [06 · Agent trade-offs](#slide-6)
- [07 · Structured output](#slide-7)
- [08 · Tool calls are structured output](#slide-8)
- [09 · Tools](#slide-9)
- [10 · Workflow vs agent](#slide-10)
- [11 · Orchestration patterns](#slide-11)
- [12 · Demo — CV generator](#slide-12)
- [13 · Demo architecture](#slide-13)
- [14 · Demo input](#slide-14)
- [15 · Demo — workflow backend](#slide-15)
- [16 · Demo — agent backend](#slide-16)
- [17 · Working memory](#slide-17)
- [18 · Render React in chat](#slide-18)
- [19 · Wrap-up](#slide-19)

---

<a id="slide-1"></a>

## 01 · Agents 101

`/talks/agents-101` · notes: 118 words ≈ 0:59

### On screen

*a talk by aleksandr*

#### Agents 101

From a simple API call to a working AI agent — step by step.

 `typescript`   `vercel ai sdk`   `mastra`

### Say

Hi! I'm Aleksandr. I've been an independent developer for more than 20 years.

This is my first talk in English — so please be kind to me.

You use AI agents every day — directly or indirectly. Maybe you've wondered how they are built.

In the next 20 minutes we go from one simple API call to a working agent. Three building blocks: completion, structured output, and tools. Then we put them in a loop. That loop is what makes an agent.

At the end — a live demo. A CV generator with two backends: a workflow and an agent. Same input, and we compare how they work. All the code is in the repo — QR code on the last slide.

---

<a id="slide-2"></a>

## 02 · Agenda

`/agenda.md` · notes: 34 words ≈ 0:17

### On screen

*agenda*

##### What we'll cover

- 01 · Completion vs. Agents — ~3 min
- 02 · Structured output & tools — ~4 min
- 03 · Workflow vs. agent · orchestration — ~2 min
- 04 · Live demo — CV generator — ~8 min
- 05 · Wrap-up — ~1 min

### Say

Here is the plan.

**[click]** Completion — the simplest building block.

**[click]** Structured output and tools.

**[click]** Workflow or agent — and how agents work together.

**[click]** The live demo — the biggest part of the talk.

**[click]** And a short recap.

---

<a id="slide-3"></a>

## 03 · Completion

`/01-completion` · notes: 69 words ≈ 0:35

### On screen

*the simplest building block*

##### One call in, one string out.

`completion.ts`

```ts
import { generateText } from "ai"

const { text } = await generateText({
  model:  openai("gpt-6-sol"),
  prompt: "Rewrite my work experience nicely.",
})

// → "Aleksandr, 20+ years in product architecture, AI and privacy…"
```

Send a prompt. Get a string back. That's it.

### Say

Let's start simple. Completion is one call: you send a prompt, you get text back.

Here it is in the AI SDK — generateText. A model, a prompt: "rewrite my work experience nicely". We get a string. That's it.

Fine for a chat reply. But if the next step is code, a string is the wrong shape — you would have to parse it. We'll fix that soon with structured output.

---

<a id="slide-4"></a>

## 04 · Completion in workflow

`/01-completion/workflow` · notes: 78 words ≈ 0:39

### On screen

*know the steps? ship a workflow*

##### Completion shines inside a workflow.

> **Diagram:** Workflow: extract skills, format experience, compose the final object — [completion-workflow.svg](public/diagrams/completion-workflow.svg)

Steps known in advance. You wire them. The model fills the blanks.

- **+ predictable** — every step is in your code
- **+ cheap** — fewer tokens, fewer round-trips
- **+ debuggable** — logs at every boundary
- **+ safe** — no surprise tool calls

### Say

And that's not a bad thing. Completion is the right tool when the plan is known.

You put it in a workflow. Step one extracts skills. Step two formats experience. Step three builds the object. You wire the steps — the model fills the blanks.

**[click]** Predictable — every step is in your code.

**[click]** Cheap — fewer tokens, no loop.

**[click]** Easy to debug — if step two breaks, you know where to look.

**[click]** Safe — the model can't do anything you didn't ask for.

---

<a id="slide-5"></a>

## 05 · When you need an agent

`/01-completion/agent` · notes: 82 words ≈ 0:41

### On screen

*no plan? no problem.*

##### When steps aren't known up front.

> **Diagram:** Agent loop: the model calls a tool, gets the result back, and repeats until it can answer — [agent-loop.svg](public/diagrams/agent-loop.svg)

 same model + tools + loop

The model chooses which function to call, inspects the result, and decides what to do next.

It can recover from errors, ask for missing info, and handle scenarios you didn't plan for.

### Say

But sometimes there is no clear workflow. You can't plan every case. Or you want the model to try something, see an error, and try another way.

That's where an agent comes in. Same model, same call under the hood — but in a loop, with tools. The model picks a tool, looks at the result, and decides what's next. Again and again, until the task is done.

**[click]** The model is still just predicting text. But the loop makes it feel like decisions.

---

<a id="slide-6"></a>

## 06 · Agent trade-offs

`/01-completion/trade-offs` · notes: 108 words ≈ 0:54

### On screen

*flexibility isn't free*

##### Agents pay in tokens & trust.

**\+ what you get**

###### Adaptivity

- + Recovers from tool errors on its own
- + Asks for missing information
- + Handles cases you didn't foresee

**− what you pay**

###### Unpredictability

- − More tokens, more latency
- − Harder to reproduce & debug
- − Can ignore instructions & drift off-task

Know your steps? → workflow.  ·  Don't? → agent.  ·  Either way: know the risks.

### Say

But this flexibility is not free.

What you get is real — I've seen agents fix their own broken JSON, switch tools after a failure, ask the user for a missing date.

**[click]** What you pay: more tokens, because the model reads the tool list on every step. Runs are hard to repeat — same input, different path. And the big one: an agent can ignore the rules in your prompt. A prompt is a request, not a lock. So the rules that really matter — money, permissions, data — check them in code.

**[click]** Simple rule: know the steps — workflow. Don't know — agent. In the demo we'll run the same task both ways.

---

<a id="slide-7"></a>

## 07 · Structured output

`/02-structured` · notes: 135 words ≈ 1:08

### On screen

*useful everywhere — not just for agents*

##### Objects, not paragraphs.

`extract.ts`

```ts
const { output } = await generateText({
  model:  openai("gpt-6-sol"),
  output: Output.object({
    schema: z.object({
      name:   z.string(),
      skills: z.array(z.string()),
      years:  z.number().min(0),
    }),
  }),
  prompt: userText,
})

// output is fully typed. no parsing.
```

Give the model a Zod schema. Get a typed object back.

Works in workflows, in validation, inside agents — anywhere you need a predictable output shape.

> **// heads up:** models occasionally break JSON. Strict mode helps where the provider supports it. Otherwise plug in a fixer, or re-send to a cheap model (e.g. gpt-6-luna) for repair.

### Say

Before we go deeper — structured output. It's useful everywhere, not only in agents.

Free text is fine for chat, but your code needs an object with named fields. In the AI SDK it's the same generateText call — you add an output option: Output.object with a Zod schema. You get a typed object back. No "please answer in JSON" tricks. If you see generateObject in old tutorials — that's the old way, now deprecated.

**[click]** It works everywhere: a workflow step, validation, an agent tool. In our demo, one Zod schema is used in several places.

**[click]** But there is one problem: models sometimes break JSON. Some providers have a strict mode — use it if you can. If not, use a JSON fixer library, or send the broken output to a cheap model like gpt-6-luna to repair it.

---

<a id="slide-8"></a>

## 08 · Tool calls are structured output

`/02-structured/tool-call` · notes: 78 words ≈ 0:39

### On screen

*how structured output and tools connect*

##### A tool call is structured output + execute.

> **Diagram:** The model returns tool name and arguments; your code runs the tool and sends the result back — [tool-call.svg](public/diagrams/tool-call.svg)

The model doesn't *call* anything — it **asks** in JSON. Your code calls.

### Say

One quick bridge. Structured output and tools are closer than they look.

A tool call is just structured output. The model replies with JSON: "I want to call extractMetadata with this text". Your code finds the function, runs it, and sends the result back to the model.

The model never calls anything. It can't — it only generates text. Your code does the real work.

**[click]** Once you see this, tools stop being magic. The model asks. Your code calls.

---

<a id="slide-9"></a>

## 09 · Tools

`/02-tools` · notes: 120 words ≈ 1:00

### On screen

*now we're talking about agents*

##### A tool is a function the model can ask for.

`tools/extract-metadata.ts`

```ts
export const extractMetadata = createTool({
  id:           "extract-metadata",
  description:  "Extract a draft CV from free-form user text.",
  inputSchema:  z.object({ text: z.string() }),
  outputSchema: DraftCVSchema,
  execute: async ({ text }) => {
    const { output } = await generateText({
      model:  openai("gpt-6-luna"), // cheap — structured extraction
      output: Output.object({ schema: DraftCVSchema }),
      prompt: `Extract from: ${text}`,
    })
    return output
  },
})
```

1.  Model reads the **description**.
2.  Decides it fits the task.
3.  Fills **inputSchema** (Zod) with args.
4.  `execute()` runs. Result goes back.

The agent chooses *when* and *which* tool to call. You don't.

### Say

Now tools — this is where agent behavior lives.

This is real code from the demo, with Mastra's createTool: an id, a description, input and output Zod schemas, and an execute function. The model never sees the execute body — only the description and the schemas.

**[click]** So the description is the most important part. A vague description — and the model never picks the tool.

**[click]** The model decides if the tool fits the task.

**[click]** It fills the input schema with arguments from the conversation.

**[click]** Your code runs execute, and the result goes back to the model. The loop continues.

**[click]** The key point: you don't call the tool. The agent decides when and which. You wrote the code — but you are not calling it.

---

<a id="slide-10"></a>

## 10 · Workflow vs agent

`/03-orchestration` · notes: 79 words ≈ 0:40

### On screen

*one rule of thumb*

##### Known steps? Workflow. Unknown? Agent.

**workflow**

###### You wire the steps.

- + Deterministic — you control each step
- + Cheaper · easier to debug
- + Human-in-the-loop can emulate agent-like behavior

> **Diagram:** Three fixed steps wired by you — [workflow-mini.svg](public/diagrams/workflow-mini.svg)

**agent**

###### You give it a goal.

- + Adaptive — recovers & improvises
- + Asks for data it doesn't have
- − May drift, ignore prompt rules

> **Diagram:** A goal goes into a loop that calls tools and gets results back — [agent-mini.svg](public/diagrams/agent-mini.svg)

### Say

So — two approaches, side by side.

Workflow: you write the steps. You control everything, it's cheaper and easier to debug. And a workflow can still talk to the user — it pauses, asks a question, and continues. That's human-in-the-loop, and our workflow backend does exactly this.

**[click]** Agent: you give it a goal and tools, and it finds the way. More flexible — but it can drift.

You don't need an agent everywhere. Often a workflow with one smart step is enough.

---

<a id="slide-11"></a>

## 11 · Orchestration patterns

`/03-orchestration/patterns` · notes: 103 words ≈ 0:52

### On screen

*one agent is rarely enough*

##### Three ways to compose.

**01 · supervisor**

###### Supervisor

One lead agent breaks the task down and dispatches to specialists.

> **Diagram:** A lead agent sends tasks to agents A and B — [supervisor.svg](public/diagrams/supervisor.svg)

**02 · swarm**

###### Swarm

No boss. Agents pass control to each other — "this part is yours".

> **Diagram:** Agents A, B and C hand control to each other — [swarm.svg](public/diagrams/swarm.svg)

**03 · router**

###### Router

Reads the request, hands it to the right specialist. Doesn't execute.

> **Diagram:** A router sends the request to a code agent or a text agent — [router.svg](public/diagrams/router.svg)

In real life you mix them: a workflow step that is an agent with a supervisor inside.

### Say

Sometimes one agent is not enough. Three common patterns.

Supervisor: one lead agent splits the task and gives parts to other agents — like a manager with a team.

Swarm: no boss. An agent works until it sees "this is not my job" — then it hands control to another agent. Think of a support bot: triage, then billing, then tech support.

Router: it only reads the request and sends it to the right agent. It does no work itself.

**[click]** In real life you mix them — for example, a workflow where one step is a supervisor with a few agents. Pick what fits your task.

---

<a id="slide-12"></a>

## 12 · Demo — CV generator

`/demo/cv-generator` · notes: 54 words ≈ 0:27

### On screen

*§ 04 — DEMO*

##### Let's run a CV gen

Same chat input. Two backends — workflow and agent. We compare.

### Say

Let's put it all together. I built a small chat app: you describe yourself in free text, and it makes a CV as a PDF.

Under the hood — two backends. One is a workflow, one is an agent. Same input, same result, different path. The code is ready — the live part is the comparison.

---

<a id="slide-13"></a>

## 13 · Demo architecture

`/demo/architecture` · notes: 60 words ≈ 0:30

### On screen

*same input · same output · two paths*

##### One chat, two backends.

> **Diagram:** Chat UI posts to one API route, which runs either the workflow or the agent; both return the same CV object — [demo-architecture.svg](public/diagrams/demo-architecture.svg)

 `UI doesn't know which backend ran`   `we switch with a flag`   `same CV shape either way`

### Say

A quick map. The chat sends the message to one API route. A flag picks the backend: workflow or agent.

**[click]** The UI doesn't know which one ran — it gets the same events.

**[click]** We switch with one flag in the request.

**[click]** And both return the same CV object, checked by the same Zod schema. Same contract, two ways to build it.

---

<a id="slide-14"></a>

## 14 · Demo input

`/demo/chat` · notes: 61 words ≈ 0:31

### On screen

*the user types this*

###### Free-form chat, no form fields.

`chat · new message`

user ▍ My name is Aleksandr.  
 20+ years in product architecture — LLM, AI, ML, zero-knowledge security.  
 At Denovo: consulting for LegalTech and EdTech startups.  
 Stack: TypeScript, Node, Tauri, Electron, on-device ML, LoRA fine-tuning.  
 ── goal ──────────────────────────────  
 output: a structured CV { name, headline, skills\[\], jobs\[\] }  

Same input below. Watch how the two backends reach the same object differently.

### Say

The input is just a chat message — the way you'd describe yourself to a person.

**[click]** The goal is a typed CV object: name, headline, skills, jobs.

**[click]** One trick: on stage I'll leave out the company name. Then we watch how each backend handles the missing data. The workflow asks a question we wrote in code. The agent decides on its own.

---

<a id="slide-15"></a>

## 15 · Demo — workflow backend

`/demo/workflow.ts` · notes: 103 words ≈ 0:52

### On screen

*backend a · steps you wire yourself*

##### Workflow: extract → merge → validate → branch.

`workflows/cv-workflow.ts`

```ts
export const cvWorkflow = createWorkflow({ id: "cv-workflow", inputSchema })
  .then(extract)    // 1 × Output.object → DraftCVSchema · gpt-6-luna
  .then(merge)      // plain code — keep fields already filled
  .then(validate)   // CVSchema.safeParse → { valid, issue }
  .branch([
    [async ({ inputData }) => !inputData.valid, askStep],   // → question
    [async ({ inputData }) =>  inputData.valid, readyStep], // → confirm PDF
  ])
  .commit()
```

 `one LLM call per turn`   `cheap — luna for extraction`   `branch is code, not the model`

### Say

Backend A — the workflow. Four steps, wired with Mastra's createWorkflow: extract, merge, validate, branch.

Extract is the only model call — gpt-6-luna, the cheapest model, reasoning off. Merge is plain code: it keeps what we already know. Validate checks the draft with Zod. Branch is plain code too: ask about the missing field, or show the CV.

**[click]** One model call per turn.

**[click]** A cheap model is enough for simple extraction.

**[click]** And every path is in our code — no surprises.

**▶ LIVE: reload the page (new thread) → click the badge to "mode: workflow" → paste the prompt without the company**

Watch the steps: extract, merge, validate… and it asks: "Which company was that role at?"

**▶ Reply "Denovo" → Yes on the card → open the PDF**

Every step was visible, and every step was our code.

---

<a id="slide-16"></a>

## 16 · Demo — agent backend

`/demo/agent.ts` · notes: 154 words ≈ 1:17

### On screen

*backend b · goal + tools, no script*

##### Agent: instructions, tools, working memory.

`agents/cv-agent.ts`

```ts
export const cvAgent = new Agent({
  id:    "cv-agent",
  model: "openai/gpt-6-sol",
  instructions: `
    You are a CV-building agent. Extract → validate → confirm → generate.
    Never invent facts. Never call generatePdf without explicit approval.`,
  tools:  { extractMetadata, validateCV, askConfirmation, generatePdf, webSearch },
  memory, // per-thread draft, schema = DraftCVSchema
})
```

 `picks its own path`   `same CV shape`   `webSearch is optional — agent decides`   `more tokens, less predictable`

### Say

Backend B — the agent. Same task, but no steps. Just instructions, tools and memory.

The instructions say: extract, validate, confirm, generate. And one rule: never make the PDF without the user's approval. That's only a line in a prompt — a soft guardrail. The hard one is in code: generatePdf only accepts a complete, valid CV.

Five tools — four do the same jobs as the workflow steps. The fifth is web search: the agent may use it to check a company name. Or may not. It decides.

**[click]** The agent picks the order. No branch in our code.

**[click]** Same CV shape as the workflow.

**[click]** Web search is optional — the model decides.

**[click]** The price: more model calls, and more variance.

**▶ LIVE: reload the page (new thread, starts in "mode: agent") → paste the same prompt**

Look at the tool calls: extract, save to memory, validate… It finds the missing company and asks for it.

**▶ Reply "Denovo" → point at webSearch if it fires → Yes → PDF**

Same input, same PDF — but a different path. More tool calls, more tokens. That's the price of flexibility.

---

<a id="slide-17"></a>

## 17 · Working memory

`/demo/working-memory` · notes: 81 words ≈ 0:41

### On screen

*what makes the agent feel like a person*

##### Schema-backed memory.

`lib/memory.ts`

```ts
export const memory = new Memory({
  storage,              // libsql
  options: {
    workingMemory: {
      enabled: true,
      schema: DraftCVSchema, // same Zod schema
    },
  },
})
```

Mastra injects the current draft into every turn. Agent writes it back via `updateWorkingMemory`.

- + Turn 1 fills `name`, `skills`
- + Turn 2 fills `jobs` — turn 1 is remembered
- + Turn 3 confirms — agent reads memory, calls `generatePdf`

Same `DraftCVSchema` the workflow uses. One Zod schema, three call-sites — and one more on the next slide.

### Say

How did the agent remember the name between messages? Working memory.

Mastra keeps a draft for each conversation, with the same Zod schema. It gives the draft to the model every turn, and the agent updates it with a built-in tool.

**[click]** Turn one: name and skills.

**[click]** Turn two: only the new data — the company.

**[click]** Turn three: "yes" — it reads the full draft and makes the PDF.

**[click]** And it's the same schema the workflow uses. One schema keeps both backends in sync.

---

<a id="slide-18"></a>

## 18 · Render React in chat

`/demo/render-react` · notes: 78 words ≈ 0:39

### On screen

*one minute on the UI — this is HelsinkiJS*

##### Agent speaks JSON. React renders.

`tools/ask-confirmation.ts`

```ts
outputSchema: z.object({
  field: z.string(),
  proposedValue: z.string(),
  ui: z.object({
    type: z.literal("ConfirmCard"),
    props: ConfirmSchema,   // same Zod
  }),
}),
```

`app/page.tsx`

```tsx
<Renderer
  spec={{ root: "r", elements: {
    r: { type: spec.type, props: spec.props },
  }}}
  registry={registry}
/>
```

Each tool output carries a `ui` spec. Agent picks the tool — agent picks the component.

- + `validateCV` valid → `CVCard`
- + `askConfirmation` → `ConfirmCard`
- + Unknown type → nothing renders. Fail-safe.

One Zod schema, four call-sites. extract · memory · validate · render.

### Say

Since this is HelsinkiJS — one minute on the frontend.

The CV card and the Yes/No card are real React components. The model never sends HTML. A tool returns a small spec — a component name and its props — and React renders it.

**[click]** validateCV returns a CVCard.

**[click]** askConfirmation returns a ConfirmCard.

**[click]** An unknown type renders nothing. Safe by default.

**[click]** So the agent picks the component by picking the tool. Same Zod schema — all the way down to React props.

---

<a id="slide-19"></a>

## 19 · Wrap-up

`/wrap-up` · notes: 80 words ≈ 0:40

### On screen

*recap*

##### One call → a full agent.

- **completion** — for predictable steps
- **structured** — data over text
- **tools** — let the agent act
- **memory** — one Zod schema, many call-sites
- **agent** — when the path is unknown · mind the risks

\> scan for the code

github.com/beshkenadze/agents-101

Thanks! Find me after the talk. @beshkenadze · agents 101

### Say

Let's wrap up.

Completion — one call, one answer. Great for steps you know.
Structured output — data, not text.
Tools — the model asks, your code acts.
Memory — the agent remembers between turns.

And an agent is all of this in a loop. Use it when the path is not known. Start with a workflow — and add an agent when the workflow is not enough.

All the code is in the repo — scan the QR. Thank you! Find me after the talk.

---

## Version history

Changes to the slides, newest first.

| Date | Commit | Change |
|---|---|---|
| 2026-10-14 | [`01a69d6`](https://github.com/beshkenadze/agents-101/commit/01a69d6) | Wrap-up slide trimmed; README rewritten for people who scan the QR |
| 2026-10-14 | [`85c98bf`](https://github.com/beshkenadze/agents-101/commit/85c98bf) | slides: demo chapter notes trimmed; stage directions marked as LIVE lines |
| 2026-10-14 | [`46f80e1`](https://github.com/beshkenadze/agents-101/commit/46f80e1) | slides: chapter 03 notes trimmed; 'known steps' heading instead of flowchart |
| 2026-10-14 | [`d2727f4`](https://github.com/beshkenadze/agents-101/commit/d2727f4) | slides: chapter 02 notes trimmed; tool heading no longer says the model calls it |
| 2026-10-14 | [`c00195d`](https://github.com/beshkenadze/agents-101/commit/c00195d) | slides: chapter 01 notes trimmed; intro mentions first English talk; 20+ years everywhere |
| 2026-10-13 | [`09d5d5b`](https://github.com/beshkenadze/agents-101/commit/09d5d5b) | slides: shorter agenda notes; agenda ends with wrap-up |
| 2026-10-12 | [`a3a70fe`](https://github.com/beshkenadze/agents-101/commit/a3a70fe) | slides: tighter intro notes; QR now points to the repo |
| 2026-10-12 | [`28f5685`](https://github.com/beshkenadze/agents-101/commit/28f5685) | slides: replace ASCII diagrams with archify SVGs |
| 2026-10-12 | [`c6b87d7`](https://github.com/beshkenadze/agents-101/commit/c6b87d7) | Use gpt-6-sol for the agent and slide examples; fix stale tool list in chat header |
| 2026-10-12 | [`3302074`](https://github.com/beshkenadze/agents-101/commit/3302074) | Use gpt-6-luna for extraction (reasoning off) |
| 2026-10-12 | [`d6c6fec`](https://github.com/beshkenadze/agents-101/commit/d6c6fec) | slides: event is HelsinkiJS, not React Helsinki |
| 2026-10-12 | [`8b44211`](https://github.com/beshkenadze/agents-101/commit/8b44211) | slides: match updated demo code and talk revisions |
| 2026-04-20 | [`c6a9a36`](https://github.com/beshkenadze/agents-101/commit/c6a9a36) | Add 'Render React in chat' slide for React Helsinki angle |
| 2026-04-20 | [`045faf5`](https://github.com/beshkenadze/agents-101/commit/045faf5) | Simplify presenter notes for B1-B2 English level |
| 2026-04-20 | [`4924312`](https://github.com/beshkenadze/agents-101/commit/4924312) | Flesh out presenter notes to ~20-min delivery; add live demo narration |
| 2026-04-20 | [`0b72107`](https://github.com/beshkenadze/agents-101/commit/0b72107) | Align presenter notes with click sequence; reword 'build live' to 'demo' |
| 2026-04-20 | [`91b88a3`](https://github.com/beshkenadze/agents-101/commit/91b88a3) | Align slides with demo reality: real workflow/agent code, Mastra createTool, working-memory slide |
| 2026-04-19 | [`419e619`](https://github.com/beshkenadze/agents-101/commit/419e619) | Add tool-call bridge slide, demo architecture slide, and real QR |
| 2026-04-19 | [`96bd300`](https://github.com/beshkenadze/agents-101/commit/96bd300) | Drop download:true — skip PDF export step in CI |
| 2026-04-19 | [`87d6b8c`](https://github.com/beshkenadze/agents-101/commit/87d6b8c) | Initial commit — Agents 101 talk deck |
