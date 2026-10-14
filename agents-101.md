# Agents 101

> From a simple API call to a working AI agent — step by step.

| | |
|---|---|
| **Version** | `2026.10.14-12beb13` |
| **State** | Branch `talk-texts`, **not merged to `main` yet** — the published deck is older. |
| **Format** | 20 min · live demo · 20 slides |
| **Speaker notes** | 1842 words ≈ 15:26 at 120 wpm (budget 19 min) |
| **Slides** | https://beshkenadze.github.io/agents-101/ |
| **Code** | https://github.com/beshkenadze/agents-101 |

*Generated from `slides.md` by `bun run export:md`. Edit the slides, not this file.*

## Timing

Notes only — clicks, pauses and the live demo add time on top.

| Section | Slides | Notes | Budget |
|---|---|---|---|
| 00 · Intro & agenda | 1–2 | 1:22 ⚠️ | 1:00 |
| 01 · Completion vs. agents | 3–6 | 3:12 ⚠️ | 3:00 |
| 02 · Structured output & tools | 7–9 | 2:57 | 4:00 |
| 03 · Workflow vs. agent · orchestration | 10–11 | 1:37 | 2:00 |
| 04 · Live demo — CV generator | 12–18 | 5:26 | 8:00 |
| end · Wrap-up | 19–20 | 0:52 | 1:00 |
| **Total** | 1–20 | **15:26** | **19:00** |

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
- [19 · Next talk](#slide-19)
- [20 · Wrap-up](#slide-20)

---

<a id="slide-1"></a>

## 01 · Agents 101

`/talks/agents-101` · notes: 129 words ≈ 1:05

### On screen

*a talk by aleksandr*

#### Agents 101

From a simple API call to a working AI agent — step by step.

 `typescript`   `vercel ai sdk`   `mastra`

### Say

Hi! I'm Aleksandr. I've been an independent developer for more than 20 years.

This is my first talk in English — so please be kind to me.

You use AI agents every day — directly or indirectly. Maybe you want to know how they are built.

In the next 20 minutes, we go from one simple API call to a working agent. We will look at three building blocks: completion, structured output, and tools. Then we put them in a loop. This loop is what makes an agent.

At the end, I'll show a live demo. It's a CV generator with two backends: a workflow and an agent. Same input — and we compare how they work. All the code is in the repo. The QR code is on the last slide.

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

`/01-completion` · notes: 75 words ≈ 0:38

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

Let's start simple. Completion is one call. You send a prompt, and you get text back.

Here it is in the AI SDK: generateText. We give it a model and a prompt: "Rewrite my work experience nicely." We get a string back. That's all.

This is fine for a chat. But if the next step is code, a string is not enough — you have to parse it. We will fix this soon with structured output.

---

<a id="slide-4"></a>

## 04 · Completion in workflow

`/01-completion/workflow` · notes: 86 words ≈ 0:43

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

Completion is simple — and simple is good. It's the right tool when you know the plan.

You put it in a workflow. Step one: extract the skills. Step two: format the experience. Step three: build the object. You connect the steps. The model fills in the blanks.

**[click]** It's predictable — every step is in your code.

**[click]** It's cheap — fewer tokens, no loop.

**[click]** It's easy to debug — if step two breaks, you know where to look.

**[click]** And it's safe — the model can't do anything you didn't ask for.

---

<a id="slide-5"></a>

## 05 · When you need an agent

`/01-completion/agent` · notes: 104 words ≈ 0:52

### On screen

*no plan? no problem.*

##### When steps aren't known up front.

> **Diagram:** Agent loop: the model calls a tool, gets the result back, and repeats until it can answer — [agent-loop.svg](public/diagrams/agent-loop.svg)

 same model + tools + loop

The model chooses which function to call, inspects the result, and decides what to do next.

It can recover from errors, ask for missing info, and handle scenarios you didn't plan for.

### Say

But sometimes there is no clear workflow. You can't plan every case. Or you want the model to try something, see an error, and try another way.

This is where an agent comes in. It's the same model and the same call. But now it runs in a loop, and it has tools. A tool is just a function in your code — more about this soon.

The model picks a tool, looks at the result, and decides what to do next. Again and again, until the task is done.

**[click]** The model still just predicts text. But the loop makes it look like it decides.

---

<a id="slide-6"></a>

## 06 · Agent trade-offs

`/01-completion/trade-offs` · notes: 117 words ≈ 0:59

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

What you get is real. I've seen agents fix their own broken JSON, switch to another tool after an error, and ask the user for a missing date.

**[click]** What you pay: more tokens, because every step sends the whole conversation to the model again. It's hard to repeat a run — same input, different path. And the most important one: an agent can ignore the rules in your prompt. A prompt is a request, not a lock. So check important rules in code — money, permissions, data.

**[click]** A simple rule: you know the steps — use a workflow. You don't — use an agent. In the demo, we will run the same task both ways.

---

<a id="slide-7"></a>

## 07 · Structured output

`/02-structured` · notes: 143 words ≈ 1:12

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

Free text is fine for a chat. But your code needs an object with fields. In the AI SDK, you use the same generateText call. You just add an output option: Output.object with a Zod schema. And you get a typed object back. No "please answer in JSON" tricks.

In old tutorials, you may see generateObject. That's the old way — it's deprecated now.

**[click]** It works everywhere: in a workflow step, in validation, in an agent tool. In our demo, we use the same Zod schemas in many places.

**[click]** But there is one problem: models sometimes break JSON. Some providers have a strict mode — use it if you can. If not, use a JSON fixer library. Or send the broken output to a cheap model, like gpt-6-luna, to fix it.

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

Structured output and tools are closer than they look.

A tool call is just structured output. The model answers with JSON: "I want to call extractMetadata with this text." Your code finds the function, runs it, and sends the result back to the model.

The model never calls anything. It can't — it only writes text. Your code does the real work.

**[click]** When you see it like this, tools are not magic anymore. The model asks. Your code calls.

---

<a id="slide-9"></a>

## 09 · Tools

`/02-tools` · notes: 131 words ≈ 1:06

### On screen

*now we're talking about agents*

##### A tool is a function the model can ask for.

`tools/extract-metadata.ts`

```ts
export const extractMetadata = createTool({
  id: "extract-metadata",
  description: "Extract a draft CV from free text.",
  inputSchema: z.object({ text: z.string() }),
  outputSchema: DraftCVSchema,
  execute: async ({ text }) => {
    const { output } = await generateText({
      model: openai("gpt-6-luna"), // cheap model
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

Now tools. This is where the agent behavior lives.

This is simplified code from the demo, with createTool from Mastra. A tool has an id, a description, input and output schemas, and an execute function. The model never sees the execute function. It only sees the name, the description, and the input schema.

**[click]** So the description is the most important part. If it's not clear, the model may not pick the tool.

**[click]** The model decides if the tool fits the task.

**[click]** It fills the input schema with data from the conversation.

**[click]** Your code runs execute, and the result goes back to the model. Then the loop continues.

**[click]** The main point: the model decides when to call a tool, and which one. The framework runs it. You don't write this logic yourself.

---

<a id="slide-10"></a>

## 10 · Workflow vs agent

`/03-orchestration` · notes: 84 words ≈ 0:42

### On screen

*one rule of thumb*

##### Known steps? Workflow. Unknown? Agent.

**workflow**

###### You wire the steps.

- + Fixed order — you control each step
- + Cheaper · easier to debug
- + Can ask the user, like an agent

> **Diagram:** Three fixed steps wired by you — [workflow-mini.svg](public/diagrams/workflow-mini.svg)

**agent**

###### You give it a goal.

- + Adaptive — recovers & improvises
- + Asks for data it doesn't have
- − May drift, ignore prompt rules

> **Diagram:** A goal goes into a loop that calls tools and gets results back — [agent-mini.svg](public/diagrams/agent-mini.svg)

### Say

So — two approaches, side by side.

Workflow: you write the steps. You control everything. It's cheaper and easier to debug. And a workflow can still talk to the user: it stops, asks a question, and continues. This is called human-in-the-loop. Our workflow backend does exactly this.

**[click]** Agent: you give it a goal and some tools, and it finds the way. It's more flexible — but it can go off track.

You don't need an agent everywhere. Often, a workflow with one smart step is enough.

---

<a id="slide-11"></a>

## 11 · Orchestration patterns

`/03-orchestration/patterns` · notes: 109 words ≈ 0:55

### On screen

*when one agent is not enough*

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

In real life you mix them: a workflow where one step is a supervisor with a few agents.

### Say

Sometimes one agent is not enough. Here are three common patterns.

Supervisor: one main agent splits the task and gives parts to other agents. Like a manager with a team.

Swarm: there is no boss. An agent works until it sees "this is not my job". Then it passes the work to another agent. For example, a support bot: first-line support, then billing, then tech support.

Router: it only reads the request and sends it to the right agent. It does no work itself.

**[click]** In real life, you mix them. For example, a workflow where one step is a supervisor with a few agents. Choose what fits your task.

---

<a id="slide-12"></a>

## 12 · Demo — CV generator

`/demo/cv-generator` · notes: 57 words ≈ 0:29

### On screen

*§ 04 — DEMO*

##### Let's run a CV gen

Same chat input. Two backends — workflow and agent. We compare.

### Say

Now let's put it all together. I built a small chat app. You describe yourself in plain text, and it makes a CV as a PDF.

It has two backends. One is a workflow, and one is an agent. Same input, same result — but a different path. The code is ready. The live part is the comparison.

---

<a id="slide-13"></a>

## 13 · Demo architecture

`/demo/architecture` · notes: 64 words ≈ 0:32

### On screen

*same input · same output · two paths*

##### One chat, two backends.

> **Diagram:** Chat UI posts to one API route, which runs either the workflow or the agent; both return the same CV object — [demo-architecture.svg](public/diagrams/demo-architecture.svg)

 `same cards either way`   `we switch with a flag`   `same CV shape either way`

### Say

Here is a quick map. The chat sends a message to one API route. A flag picks the backend: workflow or agent.

**[click]** Both backends show the same CV card and the same Yes/No card.

**[click]** We switch them with one flag in the request.

**[click]** And both return the same CV object, checked by the same Zod schema. Same contract — two ways to build it.

---

<a id="slide-14"></a>

## 14 · Demo input

`/demo/chat` · notes: 60 words ≈ 0:30

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

We send this to both backends — and watch how each one gets there.

### Say

The input is just a chat message — like you would describe yourself to a person.

**[click]** The goal is a typed CV object: name, headline, skills, and jobs.

**[click]** One trick: I will leave out the company name. Then we see how each backend handles missing data. The workflow asks a question that we wrote in code. The agent decides by itself.

---

<a id="slide-15"></a>

## 15 · Demo — workflow backend

`/demo/workflow.ts` · notes: 115 words ≈ 0:58

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

Backend A — the workflow. It has four steps, connected with createWorkflow from Mastra: extract, merge, validate, and branch.

Extract is the only model call. It uses gpt-6-luna — the cheapest model, with reasoning turned off. Merge is plain code: it keeps what we already know. Validate checks the draft with Zod. Branch is also plain code: it asks about the missing field, or it shows the CV.

**[click]** So, one model call per message.

**[click]** A cheap model is enough for simple extraction.

**[click]** And every path is in our code — no surprises.

**▶ LIVE: ⌘K (new conversation) → click the badge to "mode: workflow" → click the suggestion (it sends)**

Look at the steps: extract, merge, validate… and it asks: "Which company was that role at?"

**▶ Click "The company is Denovo." → Yes on the card → open the PDF**

Every step was visible, and every step was our code.

---

<a id="slide-16"></a>

## 16 · Demo — agent backend

`/demo/agent.ts` · notes: 183 words ≈ 1:32

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

Backend B — the agent. Same task, but no steps. Only instructions, tools, and memory.

The instructions say: extract, validate, confirm, and generate. And one rule: never make the PDF without the user's approval. But this is only a line in a prompt — a soft guardrail. The hard guardrail is in code: generatePdf only accepts a complete, valid CV. In a real app, I would check the approval in code too.

There are five tools. Four of them do the same jobs as the workflow steps. The fifth one is web search. The agent may use it to check a company name. Or it may not. It decides.

**[click]** The agent chooses the order. There is no branch in our code.

**[click]** The CV has the same shape as in the workflow.

**[click]** Web search is optional — the model decides.

**[click]** The price: more model calls, and less predictable results.

**▶ LIVE: ⌘K (new conversation, starts in "mode: agent") → click the suggestion (it sends)**

Look at the tool calls: extract, save to memory, validate… It finds the missing company and asks for it.

**▶ Click "The company is Denovo." → point at webSearch if it runs → Yes on the card → open the PDF**

Same input, same PDF — but a different path. More tool calls, more tokens. This is the price of flexibility.

---

<a id="slide-17"></a>

## 17 · Working memory

`/demo/working-memory` · notes: 85 words ≈ 0:43

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
- + Turn 2 fills the missing company — turn 1 is remembered
- + Turn 3 confirms — agent reads memory, calls `generatePdf`

Same `DraftCVSchema` the workflow uses.

### Say

How did the agent remember my first message? With working memory.

Mastra keeps a draft for each conversation, with the same Zod schema. It gives the draft to the model on every turn. The agent updates it with a built-in tool.

**[click]** Turn one: the name and the skills.

**[click]** Turn two: only the new data — the company.

**[click]** Turn three: "yes". The agent reads the full draft and makes the PDF.

**[click]** And this is the same schema the workflow uses. One schema keeps both backends in sync.

---

<a id="slide-18"></a>

## 18 · Render React in chat

`/demo/render-react` · notes: 84 words ≈ 0:42

### On screen

*one minute on the UI — this is HelsinkiJS*

##### Agent speaks JSON. React renders.

`tools/ask-confirmation.ts`

```ts
outputSchema: z.object({
  // …the tool's normal fields
  ui: z.object({
    type: z.literal("ConfirmCard"),
    props: ConfirmSchema,   // same Zod
  }),
}),
```

`app/page.tsx`

```tsx
<Renderer
  spec={{ root: "r", elements: { r: ui } }}
  registry={registry}
/>
```

Two tools return a `ui` spec. Agent picks the tool — agent picks the component.

- + `validateCV` valid → `CVCard`
- + `askConfirmation` → `ConfirmCard`
- + Unknown type → nothing renders. Fail-safe.

Same Zod schemas — from model output to React props.

### Say

This is HelsinkiJS, so — one minute about the frontend.

The CV card and the Yes/No card are real React components. The model never sends HTML. A tool returns a small spec — a component name and its props. React renders it.

**[click]** validateCV returns a CVCard.

**[click]** askConfirmation returns a ConfirmCard.

**[click]** If the type is unknown, nothing renders. It's safe by default.

**[click]** So the agent picks the component when it picks the tool. And the same Zod schemas go all the way to the React props.

---

<a id="slide-19"></a>

## 19 · Next talk

`/next` · notes: 22 words ≈ 0:11

### On screen

*coming next*

##### Make Your Decision

A talk about decision models.

### Say

And one more thing. My next talk is called "Make Your Decision". It's about decision models. I hope to see you there!

---

<a id="slide-20"></a>

## 20 · Wrap-up

`/wrap-up` · notes: 82 words ≈ 0:41

### On screen

*recap*

##### One call → a full agent.

- **completion** — for predictable steps
- **structured** — data over text
- **tools** — the model asks, your code acts
- **memory** — remembers between turns
- **agent** — when the path is unknown · mind the risks

\> scan for the code

github.com/beshkenadze/agents-101

Thanks! Find me after the talk. @beshkenadze · agents 101

### Say

Let's wrap up.

Completion — one call, one answer. Great when you know the steps.
Structured output — data, not text.
Tools — the model asks, your code acts.
Memory — the agent remembers between turns.

And an agent is all of this in a loop. Use it when you don't know the path. Start with a workflow, and add an agent when the workflow is not enough.

All the code is in the repo — scan the QR code. Thank you! Find me after the talk.

---

## Version history

Changes to the slides, newest first.

| Date | Commit | Change |
|---|---|---|
| 2026-10-14 | [`12beb13`](https://github.com/beshkenadze/agents-101/commit/12beb13) | demo: lock the mode badge per conversation, update stage directions |
| 2026-10-14 | [`5aaa2d6`](https://github.com/beshkenadze/agents-101/commit/5aaa2d6) | slides: teaser for the next talk, Make Your Decision |
| 2026-10-14 | [`3532785`](https://github.com/beshkenadze/agents-101/commit/3532785) | Second review pass: B2-level notes, slide fixes, readable inline code |
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
