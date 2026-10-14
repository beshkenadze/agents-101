# Agents 101

> From a simple API call to a working AI agent — step by step.

| | |
|---|---|
| **Version** | `2026.10.14-d2727f4` |
| **State** | Branch `talk-texts`, **not merged to `main` yet** — the published deck is older. |
| **Format** | 20 min · live demo · 19 slides |
| **Speaker notes** | 3177 words ≈ 26:32 at 120 wpm (budget 19 min) |
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
| 03 · Workflow vs. agent · orchestration | 10–11 | 3:16 ⚠️ | 2:00 |
| 04 · Live demo — CV generator | 12–18 | 14:57 ⚠️ | 8:00 |
| end · Wrap-up | 19–19 | 1:27 ⚠️ | 1:00 |
| **Total** | 1–19 | **26:32** | **19:00** |

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
- [19 · Wrap-up & Q&A](#slide-19)

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

`/03-orchestration` · notes: 170 words ≈ 1:25

### On screen

*one rule of thumb*

##### Flowchart fits? Workflow. Depends on the run? Agent.

**workflow**

###### You wire the steps.

- + Deterministic — you control each step
- + Cheaper · easier to debug
- + Human-in-the-loop can emulate agent-like behaviour

> **Diagram:** Three fixed steps wired by you — [workflow-mini.svg](public/diagrams/workflow-mini.svg)

**agent**

###### You give it a goal.

- + Adaptive — recovers & improvises
- + Asks for data it doesn't have
- − May drift, ignore prompt rules

> **Diagram:** A goal goes into a loop that calls tools and gets results back — [agent-mini.svg](public/diagrams/agent-mini.svg)

### Say

So — two approaches. When do you pick which? Let me put them side by side.

Workflow: you write the steps yourself. Deterministic. You own every step. Cheaper per turn. Easier to debug — the trace reads like a log file. And a workflow is not dumb. With human-in-the-loop, you can fake a lot of agent-like behavior. The workflow pauses. Asks the user a question. Resumes. That is exactly what our workflow backend does. Control stays with you.

**[click]** Agent: you give the model a goal and a toolbox. Let it figure out the rest. More adaptive. Recovers, asks, improvises. But it can drift. Go out of scope. Ignore the rules in its prompt. Do things you did not plan. The same freedom that makes it powerful makes it drift.

Simple test. If you can draw a flowchart from start to end — workflow. If the path depends on decisions mid-run — agent. Both are legitimate. You do not need an agent everywhere. Often a workflow with one smart step in the middle is enough.

---

<a id="slide-11"></a>

## 11 · Orchestration patterns

`/03-orchestration/patterns` · notes: 222 words ≈ 1:51

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

In real products, one agent is rarely enough. You end up putting several together. Three patterns worth knowing.

Supervisor. One lead agent breaks the task down and hands subtasks to specialists. "Write a report" — lead splits it into research, draft, edit. Each goes to a different agent. Lead collects the results. Classic manager-and-team.

Swarm. No lead agent. Each agent works on the conversation until it sees "this is not my job" — then it hands control to another agent. A support bot is a good example: the triage agent talks to the user, then hands off to billing, billing hands off to tech support. Control moves around, nobody sits on top. (Running many agents at the same time and merging the results is a different thing — that is just parallel fan-out.)

Router. An agent whose only job is to route. Reads the request. Picks the right specialist. Hands off. Does not execute anything itself.

**[click]** In practice, you mix them. A workflow of four steps, where step two is a supervisor with three specialists under it. Or a router at the top that sends code questions to one agent and text questions to another. Do not pick one pattern. Pick what each layer needs. And do not get stuck on "which pattern is right" — pick the one that fits the shape of your task.

---

<a id="slide-12"></a>

## 12 · Demo — CV generator

`/demo/cv-generator` · notes: 107 words ≈ 0:54

### On screen

*§ 04 — DEMO*

##### Let's build a CV gen

Same chat input. Two backends — workflow and agent. We compare.

### Say

Okay, let's put this all together. I built a small app ahead of time. It is a chat where you describe yourself in free text. The app generates a CV as a PDF.

The twist: there are two different backends under the hood. One is a workflow — the steps we just talked about. The other is an agent — the loop we just talked about. A toggle switches between them. Same chat input. Same final PDF. Very different paths.

Not "live coding" live. All the code is written already. What is live is the comparison. You will see both backends react to the same prompt in real time.

---

<a id="slide-13"></a>

## 13 · Demo architecture

`/demo/architecture` · notes: 147 words ≈ 1:14

### On screen

*same input · same output · two paths*

##### One chat, two backends.

> **Diagram:** Chat UI posts to one API route, which runs either the workflow or the agent; both return the same CV object — [demo-architecture.svg](public/diagrams/demo-architecture.svg)

 `UI doesn't know which backend ran`   `we switch with a flag`   `same CV shape either way`

### Say

Quick map before we open the app.

User types in the chat. Always the same chat. The request goes to one of two backends — workflow or agent — picked by a toggle in the UI. Both return the same CV object: name, headline, skills, jobs. The same Zod schema validates both.

**[click]** The UI does not know which backend ran. It gets the same streaming events either way — step updates, CV preview, confirm card. The same React components render both.

**[click]** We switch with a flag in the request. backend = "workflow" or "agent". Nothing else changes. Same message. Same thread id.

**[click]** The output shape is the same on purpose. That is the whole point. Same input going in. Same CV schema coming out. Very different internals. That is what makes the comparison honest. We are not comparing apples to oranges. We are comparing two ways to build the same contract.

---

<a id="slide-14"></a>

## 14 · Demo input

`/demo/chat` · notes: 154 words ≈ 1:17

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

The input is free text. Not a form. Not a wizard. Not "paste your LinkedIn URL". Just a chat message, the way you would actually describe yourself.

For the demo I will paste something like this: "My name is Aleksandr. 20+ years in product architecture — LLM, AI, ML, zero-knowledge security. At Denovo: consulting for LegalTech and EdTech startups. Stack: TypeScript, Node, Tauri, Electron, on-device ML, LoRA fine-tuning."

**[click]** The goal — a typed CV object. Name, headline, skills array, jobs array. Validated against the same Zod schema for both backends.

**[click]** A small trick on stage. I will send a partial version first — leave out something obvious, like the company name. Then watch how each backend handles the missing field. That is where the two paths differ the most. Workflow hits a code branch and asks a scripted question. Agent runs its loop and decides on its own. Same outcome. Different mechanism. You will see it clearly.

---

<a id="slide-15"></a>

## 15 · Demo — workflow backend

`/demo/workflow.ts` · notes: 388 words ≈ 3:14

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

Backend A — workflow. Let me walk through the code first, then we switch to the running app.

Four named steps. We wire them with Mastra's createWorkflow. The chain: extract, merge, validate, branch.

Extract is the only LLM call in the whole flow. One structured-output call on gpt-6-luna — the exact same extractDraft function the agent's tool uses. Cheap. Fast. Reasoning turned off. Returns a partial DraftCV — only the fields it could infer from the text.

Merge is pure code. No model. New fields fill empty slots. Already-filled fields are never wiped. That is how state grows across turns.

Validate runs the strict CVSchema through safeParse. Either passes, or returns the first missing field.

Then branch. This is Mastra's .branch() primitive. The predicate is a boolean we computed in validate. Either askStep — pick a question for the missing field. Or readyStep — ask the user to confirm the PDF. The branch is a code switch. Not a model decision.

**[click]** So per turn — one LLM call only. Everything else is code.

**[click]** gpt-6-luna is the point here. It is the smallest and cheapest model in the family. Mechanical extraction is exactly where cheap models shine. No reasoning needed, just "pull fields out of this text" — so we even switch reasoning off. A big model here would cost many times more with no measurable gain.

**[click]** The branch is ours. We own every path. Nothing surprises you.

**▶ LIVE — switch to the running app**

In the chat, check that the toggle says "workflow". Start a new thread. Paste a partial prompt — leave out the company. Something like: "My name is Aleksandr, 20 years in product architecture, TypeScript and ML, consulting for LegalTech startups." Send.

Watch the numbered step blocks appear in order.

Extract — point at it: "one LLM call, gpt-6-luna, returns a DraftCV".
Merge — "pure code, keeping the fields we already have".
Validate — "Zod safeParse, fails because company is missing".
ask-field — "code branch picked the question".

The bot asks "Which company was that at?". Reply "Denovo LLC". Send. Same chain runs again. Extract, merge, validate — this time validate passes. Branch takes readyStep. CV preview card appears. Confirm card with Yes/No.

Click Yes. PDF renders. Download link appears. Open it. There is the CV.

Recap on stage. Every step was visible. Every step was our code. One LLM call per turn. If something had broken, I could point at the exact step.

---

<a id="slide-16"></a>

## 16 · Demo — agent backend

`/demo/agent.ts` · notes: 485 words ≈ 4:03

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

Backend B — agent. Same task. Same CV shape. Completely different structure.

No steps wired by us. Three things: instructions, tools, memory.

The instructions are the agent's job description. Extract fields. Validate them. Confirm with the user. Generate the PDF. And one rule: never call generatePdf without explicit approval. Be honest about what this is — a line in a prompt. A soft guardrail. The hard guardrail is in code: generatePdf's inputSchema is the strict CVSchema, so the agent physically cannot render a CV with missing fields, no matter what it decides.

Five tools. Four overlap with the workflow. extractMetadata — same one-shot extractor. validateCV — same Zod safeParse. askConfirmation — renders a Yes/No card. generatePdf — renders the file. One extra: webSearch via Firecrawl. It is there if the agent decides it needs to check a company name. Only fires if the agent decides. That word matters.

Memory — per-thread working memory with a Zod schema. We will dig into it on the next slide. For now, know this: the draft survives across turns.

**[click]** The agent picks the tool order. There is no .branch() in our code. The state machine lives in the instructions — the prompt — not in createWorkflow.

**[click]** Same output shape as the workflow. validateCV runs the same CVSchema. The CV card uses the same Zod type. The PDF template is the same file.

**[click]** webSearch is opt-in. The model decides when. Well-known company — maybe skip. Something ambiguous — maybe fire. You cannot predict this. That is the point. That is agent judgement.

**[click]** The price: more LLM calls per turn. The agent reads the tool list every step. Also more variance — same input twice, tool order can differ, timing differs. This is the trade-off slide from Block 1, made concrete.

**▶ LIVE — flip the toggle to agent**

Flip the backend toggle in the UI to "agent". Start a fresh thread — memory is per-thread, we want a clean slate. Send the same partial prompt.

Watch the tool blocks stream in. extractMetadata fires — same as workflow's extract. Then updateWorkingMemory — that is Mastra saving the draft into memory. Then validateCV — this time the agent is calling Zod via a tool, not us calling Zod in code. Issue comes back.

The agent decides what to do with the issue. Sometimes it writes a text question directly. Sometimes it calls askConfirmation. Not deterministic. That is the point.

Reply "Denovo LLC". Here is where it gets interesting. Watch for webSearch to fire. The agent may google "Denovo LLC" to check the company name. Sometimes it does. Sometimes it does not. If it does — point at the search results on screen.

Then extractMetadata again with the new message. updateWorkingMemory. validateCV — passes now. askConfirmation — Yes/No card. Click Yes. generatePdf. Same PDF output as backend A.

Key point to call out live. Same input. Same final PDF. But you saw the agent take a different path. More tool calls. Maybe a web search. More tokens on the meter. That is the cost of flexibility, made visible.

---

<a id="slide-17"></a>

## 17 · Working memory

`/demo/working-memory` · notes: 265 words ≈ 2:13

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

One more thing. It ties the whole demo together — working memory.

An agent is not just a tool loop. It has state across turns. Mastra gives you this out of the box with the Memory class on the right. Storage can be SQLite, LibSQL, Postgres — whatever. The interesting part is workingMemory. You enable it. You pass a Zod schema. The same DraftCVSchema we use everywhere. Mastra takes the current value and injects it into the prompt at every turn. The agent calls the built-in updateWorkingMemory tool to write changes back.

What this gives you, concretely:

**[click]** Turn 1. User says "I'm Aleksandr, TypeScript and ML, consulted for legaltech". Agent extracts. Name lands. Skills land. Headline lands. Memory now has those three fields. Jobs is still empty.

**[click]** Turn 2. User says "at Denovo as consultant since 2024". Agent reads memory. Sees name and skills are already there. Does NOT re-extract them. Pulls only what is new — the jobs info. Writes memory with jobs added. Name and skills untouched. This is the difference between an agent that feels dumb — "wait, what was your name?" — and one that feels coherent.

**[click]** Turn 3. User says "yes, generate". Agent reads memory. Validates the full CV. Calls generatePdf. Done.

**[click]** The point that matters most. The same Zod schema is used in three places. Workflow's extract step. Agent's validateCV tool. Mastra's memory config. One source of truth, three call sites. That discipline is what keeps the two backends from drifting apart. Without a shared schema, the workflow would accept CVs the agent rejects. With it, the contract is enforced by the type system.

---

<a id="slide-18"></a>

## 18 · Render React in chat

`/demo/render-react` · notes: 243 words ≈ 2:02

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

Since this is HelsinkiJS — one minute on the frontend side.

The CV card and the Yes/No card you saw in the demo — both rendered via json-render. No innerHTML. No raw HTML from the model.

The flow is simple. Each tool has two jobs now. Do the work, and return a ui spec that says which component to render. askConfirmation returns ui.type "ConfirmCard". validateCV on success returns ui.type "CVCard". Same pattern in every tool that wants to draw something.

On the frontend, we walk through the tool outputs. For any output with a ui field, we pass it to Renderer. The catalog maps type names to React components. Registry provides the actual components. No switch logic on the frontend.

**[click]** validateCV returns a CVCard spec when the draft passes CVSchema. The CV preview appears as soon as validation succeeds.

**[click]** askConfirmation returns a ConfirmCard spec. Yes/No buttons, typed props, same Renderer.

**[click]** If the model returns a type that is not in the catalog — nothing renders. No error. No crash. Safe by design.

**[click]** So the agent picks the component by picking the tool. That is generative UI with a safety rail. And our Zod schema now has four call-sites — extract, memory, validate, render. One source of truth from the LLM output all the way down to React props.

Honest note: we have two components registered for this talk. Register more and the agent can pick from a bigger palette. The mechanism is ready.

---

<a id="slide-19"></a>

## 19 · Wrap-up & Q&A

`/wrap-up` · notes: 174 words ≈ 1:27

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

Thanks. Questions? @beshkenadze · agents 101

### Say

Quick recap. We went from one generateText call to a working agent with memory. Step by step.

Completion — one call in, one string out. Use it when the plan is fixed.

Structured output — so you get typed data, not a paragraph to parse. Plug in a repair pass if JSON breaks.

Tools — structured output that your code runs. This is how the agent acts, not just talks.

Memory — state across turns, backed by a Zod schema. The same schema that validates output also shapes what the agent remembers, and what React renders. One schema, four call sites. That is the spine.

Agent — completion plus tools plus a loop. Use it when the path is not known up front. Remember the costs: more tokens, higher variance, the chance of drift. Start with a workflow. Reach for an agent when the workflow cannot express the task.

QR code — the demo repo. Workflow and agent live side by side, with shared Zod schemas. Links to Mastra and AI SDK docs in the README.

Thanks for listening. Questions.

---

## Version history

Changes to the slides, newest first.

| Date | Commit | Change |
|---|---|---|
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
