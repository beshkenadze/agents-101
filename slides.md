---
theme: default
title: Agents 101
info: From a simple API call to a working AI agent — step by step.
author: Aleksandr Beshkenadze
presenter: true
exportFilename: agents-101
canvasWidth: 1920
htmlAttrs:
  lang: en
drawings:
  persist: false
transition: fade
fonts:
  mono: 'JetBrains Mono'
  sans: 'Space Grotesk'
routerMode: hash
path: "/talks/agents-101"
meta: "20 min · live demo"
status: "recording · live"
class: 'center-v'
---

<div class="kicker">a talk by aleksandr</div>

<h1 class="title">Agents 101<span class="caret"></span></h1>

<p class="lead" style="max-width: 50ch; color: var(--fg-dim); font-size: 28px;">From a simple API call to a working AI agent — step by step.</p>

<div style="display:flex; gap: 12px; margin-top: 40px;">
<span class="tag"><span class="dot-s"></span>typescript</span>
<span class="tag"><span class="dot-s"></span>vercel ai sdk</span>
<span class="tag"><span class="dot-s"></span>mastra</span>
</div>

<!--
Hi! I'm Aleksandr. I've been an independent developer for more than 20 years.

This is my first talk in English — so please be kind to me.

You use AI agents every day — directly or indirectly. Maybe you want to know how they are built.

In the next 20 minutes, we go from one simple API call to a working agent. We will look at three building blocks: completion, structured output, and tools. Then we put them in a loop. This loop is what makes an agent.

At the end, I'll show a live demo. It's a CV generator with two backends: a workflow and an agent. Same input — and we compare how they work. All the code is in the repo. The QR code is on the last slide.
-->

---
title: Agenda
path: "/agenda.md"
meta: "§ 00"
---

<div class="kicker">agenda</div>

<h2 class="heading">What we'll cover</h2>

<div class="agenda-grid">
<span class="n">01</span>
<span class="item" v-mark.underline.orange="1">Completion vs. Agents</span>
<span class="t">~3 min</span>
<span class="n">02</span>
<span class="item" v-mark.underline.orange="2">Structured output &amp; tools</span>
<span class="t">~4 min</span>
<span class="n">03</span>
<span class="item" v-mark.underline.orange="3">Workflow vs. agent · orchestration</span>
<span class="t">~2 min</span>
<span class="n">04</span>
<span class="item" v-mark.underline.orange="4">Live demo — CV generator</span>
<span class="t">~8 min</span>
<span class="n">05</span>
<span class="item" v-mark.underline.orange="5">Wrap-up</span>
<span class="t">~1 min</span>
</div>

<!--
Here is the plan.

[click] Completion — the simplest building block.

[click] Structured output and tools.

[click] Workflow or agent — and how agents work together.

[click] The live demo — the biggest part of the talk.

[click] And a short recap.
-->

---
title: Completion
path: "/01-completion"
meta: "§ 01 · completion"
status: "§ completion"
---

<div class="kicker">the simplest building block</div>

<h2 class="heading">One call in,<br/>one string out.</h2>

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>completion.ts</div>

```ts
import { generateText } from "ai"

const { text } = await generateText({
  model:  openai("gpt-6-sol"),
  prompt: "Rewrite my work experience nicely.",
})

// → "Aleksandr, 20+ years in product architecture, AI and privacy…"
```

<p class="body" style="margin-top: 32px; font-size: 22px;">Send a prompt. Get a string back. That's it.</p>

<!--
Let's start simple. Completion is one call. You send a prompt, and you get text back.

Here it is in the AI SDK: generateText. We give it a model and a prompt: "Rewrite my work experience nicely." We get a string back. That's all.

This is fine for a chat. But if the next step is code, a string is not enough — you have to parse it. We will fix this soon with structured output.
-->

---
title: Completion in workflow
path: "/01-completion/workflow"
meta: "§ 01 · workflow"
status: "§ workflow"
---

<div class="kicker">know the steps? ship a workflow</div>

<h2 class="heading" style="font-size: 76px;">Completion shines<br/>inside a workflow.</h2>

<div class="two-ascii-trade">
<div>
<img class="diagram" src="/diagrams/completion-workflow.svg" alt="Workflow: extract skills, format experience, compose the final object" style="margin-top: 8px;" />
<p class="body" style="margin-top: 40px; font-size: 22px;">Steps known in advance. You wire them. The model fills the blanks.</p>
</div>
<div class="trade" style="margin-top: 10px;">
<span class="k" v-click="1">+ predictable</span><span class="v" v-click="1">every step is in your code</span>
<span class="k" v-click="2">+ cheap</span><span class="v" v-click="2">fewer tokens, fewer round-trips</span>
<span class="k" v-click="3">+ debuggable</span><span class="v" v-click="3">logs at every boundary</span>
<span class="k" v-click="4">+ safe</span><span class="v" v-click="4">no surprise tool calls</span>
</div>
</div>

<!--
Completion is simple — and simple is good. It's the right tool when you know the plan.

You put it in a workflow. Step one: extract the skills. Step two: format the experience. Step three: build the object. You connect the steps. The model fills in the blanks.

[click] It's predictable — every step is in your code.

[click] It's cheap — fewer tokens, no loop.

[click] It's easy to debug — if step two breaks, you know where to look.

[click] And it's safe — the model can't do anything you didn't ask for.
-->

---
title: When you need an agent
path: "/01-completion/agent"
meta: "§ 01 · agent"
status: "§ agent loop"
---

<div class="kicker">no plan? no problem.</div>

<h2 class="heading" style="font-size: 76px;">When steps aren't<br/>known up front.</h2>

<div class="two-ascii-lead">
<div><img class="diagram" src="/diagrams/agent-loop.svg" alt="Agent loop: the model calls a tool, gets the result back, and repeats until it can answer" />
<span style="display:block; margin-top:0.8em; font-size: 24px; color: var(--warn);">same model + tools + loop</span></div>
<div>
<p class="lead" style="max-width: 32ch; font-size: 32px;">The model chooses which function to call, inspects the result, and decides what to do next.</p>
<p class="body" style="margin-top: 20px;" v-click>It can recover from errors, ask for missing info, and handle scenarios you didn't plan for.</p>
</div>
</div>

<!--
But sometimes there is no clear workflow. You can't plan every case. Or you want the model to try something, see an error, and try another way.

This is where an agent comes in. It's the same model and the same call. But now it runs in a loop, and it has tools. A tool is just a function in your code — more about this soon.

The model picks a tool, looks at the result, and decides what to do next. Again and again, until the task is done.

[click] The model still just predicts text. But the loop makes it look like it decides.
-->

---
title: Agent trade-offs
path: "/01-completion/trade-offs"
meta: "§ 01 · the cost"
status: "§ trade-offs"
---

<div class="kicker">flexibility isn't free</div>

<h2 class="heading">Agents pay in<br/>tokens &amp; trust.</h2>

<div class="split" style="margin-top: 24px;">
<div class="col pill-accent">
<span class="col-label">+ what you get</span>
<h3>Adaptivity</h3>
<ul class="checks">
<li>Recovers from tool errors on its own</li>
<li>Asks for missing information</li>
<li>Handles cases you didn't foresee</li>
</ul>
</div>
<div class="col" v-click>
<span class="col-label" style="color: var(--warn);">− what you pay</span>
<h3 style="color: var(--warn);">Unpredictability</h3>
<ul class="checks">
<li class="minus">More tokens, more latency</li>
<li class="minus">Harder to reproduce &amp; debug</li>
<li class="minus">Can ignore instructions &amp; drift off-task</li>
</ul>
</div>
</div>

<p class="rule-center" v-click><span style="color: var(--accent)">Know your steps?</span> → workflow. &nbsp;·&nbsp; <span style="color: var(--warn)">Don't?</span> → agent. &nbsp;·&nbsp; Either way: <span style="color: var(--fg);">know the risks</span>.</p>

<!--
But this flexibility is not free.

What you get is real. I've seen agents fix their own broken JSON, switch to another tool after an error, and ask the user for a missing date.

[click] What you pay: more tokens, because every step sends the whole conversation to the model again. It's hard to repeat a run — same input, different path. And the most important one: an agent can ignore the rules in your prompt. A prompt is a request, not a lock. So check important rules in code — money, permissions, data.

[click] A simple rule: you know the steps — use a workflow. You don't — use an agent. In the demo, we will run the same task both ways.
-->

---
title: Structured output
path: "/02-structured"
meta: "§ 02 · structured output"
status: "§ Output.object"
layout: split
---

<div class="kicker">useful everywhere — not just for agents</div>

<h2 class="heading" style="font-size: 80px;">Objects, not<br/>paragraphs.</h2>

::left::

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>extract.ts</div>

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

::right::

<p class="lead" style="font-size: 30px; max-width: 32ch;">Give the model a Zod schema. Get a typed object back.</p>

<p class="body" style="margin-top: 16px;" v-click>Works in workflows, in validation, inside agents — anywhere you need a predictable output shape.</p>

<div class="warn-note" v-click>
<strong>// heads up:</strong> models occasionally break JSON. Strict mode helps where the provider supports it. Otherwise plug in a fixer, or re-send to a cheap model (e.g. gpt-6-luna) for repair.
</div>

<!--
Before we go deeper — structured output. It's useful everywhere, not only in agents.

Free text is fine for a chat. But your code needs an object with fields. In the AI SDK, you use the same generateText call. You just add an output option: Output.object with a Zod schema. And you get a typed object back. No "please answer in JSON" tricks.

In old tutorials, you may see generateObject. That's the old way — it's deprecated now.

[click] It works everywhere: in a workflow step, in validation, in an agent tool. In our demo, we use the same Zod schemas in many places.

[click] But there is one problem: models sometimes break JSON. Some providers have a strict mode — use it if you can. If not, use a JSON fixer library. Or send the broken output to a cheap model, like gpt-6-luna, to fix it.
-->

---
title: Tool calls are structured output
path: "/02-structured/tool-call"
meta: "§ 02 · the bridge"
status: "§ bridge"
---

<div class="kicker">how structured output and tools connect</div>

<h2 class="heading" style="font-size: 68px;">A tool call is<br/>structured output + execute.</h2>

<img class="diagram" src="/diagrams/tool-call.svg" alt="The model returns tool name and arguments; your code runs the tool and sends the result back" style="margin-top: 24px;" />

<p class="body" style="margin-top: 32px; font-size: 24px;" v-click>The model doesn't <em style="color: var(--accent); font-style: normal;">call</em> anything — it <strong>asks</strong> in JSON. Your code calls.</p>

<!--
Structured output and tools are closer than they look.

A tool call is just structured output. The model answers with JSON: "I want to call extractMetadata with this text." Your code finds the function, runs it, and sends the result back to the model.

The model never calls anything. It can't — it only writes text. Your code does the real work.

[click] When you see it like this, tools are not magic anymore. The model asks. Your code calls.
-->

---
title: Tools
path: "/02-tools"
meta: "§ 02 · tools"
status: "§ tools"
layout: split
---

<div class="kicker">now we're talking about agents</div>

<h2 class="heading">A tool is a function<br/>the model can ask for.</h2>

::left::

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>tools/extract-metadata.ts</div>

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

::right::

<ol class="tool-steps">
<li v-click="1"><span class="idx">01</span><span class="t">Model reads the <strong>description</strong>.</span></li>
<li v-click="2"><span class="idx">02</span><span class="t">Decides it fits the task.</span></li>
<li v-click="3"><span class="idx">03</span><span class="t">Fills <strong>inputSchema</strong> (Zod) with args.</span></li>
<li v-click="4"><span class="idx">04</span><span class="t"><code style="color: var(--accent);">execute()</code> runs. Result goes back.</span></li>
</ol>

<p class="body" style="margin-top: 28px; font-size: 20px;" v-click="5">The agent chooses <em style="color: var(--accent); font-style: normal;">when</em> and <em style="color: var(--accent); font-style: normal;">which</em> tool to call. You don't.</p>

<!--
Now tools. This is where the agent behavior lives.

This is simplified code from the demo, with createTool from Mastra. A tool has an id, a description, input and output schemas, and an execute function. The model never sees the execute function. It only sees the name, the description, and the input schema.

[click] So the description is the most important part. If it's not clear, the model may not pick the tool.

[click] The model decides if the tool fits the task.

[click] It fills the input schema with data from the conversation.

[click] Your code runs execute, and the result goes back to the model. Then the loop continues.

[click] The main point: the model decides when to call a tool, and which one. The framework runs it. You don't write this logic yourself.
-->

---
title: Workflow vs agent
path: "/03-orchestration"
meta: "§ 03 · workflow vs agent"
status: "§ choose wisely"
---

<div class="kicker">one rule of thumb</div>

<h2 class="heading" style="font-size: 72px;">Known steps? Workflow.<br/>Unknown? Agent.</h2>

<div class="split" style="margin-top: 16px;">
<div class="col">
<span class="col-label">workflow</span>
<h3>You wire the steps.</h3>
<ul class="checks">
<li>Fixed order — you control each step</li>
<li>Cheaper · easier to debug</li>
<li>Can ask the user, like an agent</li>
</ul>
<img class="diagram" src="/diagrams/workflow-mini.svg" alt="Three fixed steps wired by you" style="margin-top: auto; padding-top: 28px;" />
</div>
<div class="col pill-accent" v-click>
<span class="col-label">agent</span>
<h3 style="color: var(--accent);">You give it a goal.</h3>
<ul class="checks">
<li>Adaptive — recovers &amp; improvises</li>
<li>Asks for data it doesn't have</li>
<li class="minus">May drift, ignore prompt rules</li>
</ul>
<img class="diagram" src="/diagrams/agent-mini.svg" alt="A goal goes into a loop that calls tools and gets results back" style="margin-top: auto; padding-top: 28px;" />
</div>
</div>

<!--
So — two approaches, side by side.

Workflow: you write the steps. You control everything. It's cheaper and easier to debug. And a workflow can still talk to the user: it stops, asks a question, and continues. This is called human-in-the-loop. Our workflow backend does exactly this.

[click] Agent: you give it a goal and some tools, and it finds the way. It's more flexible — but it can go off track.

You don't need an agent everywhere. Often, a workflow with one smart step is enough.
-->

---
title: Orchestration patterns
path: "/03-orchestration/patterns"
meta: "§ 03 · patterns"
status: "§ orchestration"
---

<div class="kicker">when one agent is not enough</div>

<h2 class="heading" style="font-size: 72px; margin-bottom: 24px;">Three ways to compose.</h2>

<div class="tri">
<div class="card">
<span class="idx">01 · supervisor</span>
<h4>Supervisor</h4>
<p>One lead agent breaks the task down and dispatches to specialists.</p>
<img class="diagram" src="/diagrams/supervisor.svg" alt="A lead agent sends tasks to agents A and B" style="margin-top: auto; padding-top: 16px;" />
</div>
<div class="card">
<span class="idx">02 · swarm</span>
<h4>Swarm</h4>
<p>No boss. Agents pass control to each other — "this part is yours".</p>
<img class="diagram" src="/diagrams/swarm.svg" alt="Agents A, B and C hand control to each other" style="margin-top: auto; padding-top: 16px;" />
</div>
<div class="card">
<span class="idx">03 · router</span>
<h4>Router</h4>
<p>Reads the request, hands it to the right specialist. Doesn't execute.</p>
<img class="diagram" src="/diagrams/router.svg" alt="A router sends the request to a code agent or a text agent" style="margin-top: auto; padding-top: 16px;" />
</div>
</div>

<p class="rule-center" v-click>In real life you mix them: a workflow where one step is a supervisor with a few agents.</p>

<!--
Sometimes one agent is not enough. Here are three common patterns.

Supervisor: one main agent splits the task and gives parts to other agents. Like a manager with a team.

Swarm: there is no boss. An agent works until it sees "this is not my job". Then it passes the work to another agent. For example, a support bot: first-line support, then billing, then tech support.

Router: it only reads the request and sends it to the right agent. It does no work itself.

[click] In real life, you mix them. For example, a workflow where one step is a supervisor with a few agents. Choose what fits your task.
-->

---
title: Demo — CV generator
path: "/demo/cv-generator"
meta: "§ 04 · live"
status: "live · recording"
class: 'center-v'
---

<div class="section-num">§ 04 — DEMO</div>

<h2 class="heading" style="font-size: 140px; line-height: 0.9;">Let's<br/>run<br/>a CV gen<span class="caret"></span></h2>

<p class="body" style="margin-top: 40px; font-size: 28px; max-width: 60ch; color: var(--fg-dim);">Same chat input. Two backends — workflow and agent. We compare.</p>

<!--
Now let's put it all together. I built a small chat app. You describe yourself in plain text, and it makes a CV as a PDF.

It has two backends. One is a workflow, and one is an agent. Same input, same result — but a different path. The code is ready. The live part is the comparison.
-->

---
title: Demo architecture
path: "/demo/architecture"
meta: "§ 04 · two paths"
status: "§ two backends"
---

<div class="kicker">same input · same output · two paths</div>

<h2 class="heading" style="font-size: 64px;">One chat,<br/>two backends.</h2>

<img class="diagram" src="/diagrams/demo-architecture.svg" alt="Chat UI posts to one API route, which runs either the workflow or the agent; both return the same CV object" style="margin-top: 24px;" />

<div class="tag-row" style="margin-top: 32px;">
<span class="tag" v-click="1"><span class="dot-s"></span>same cards either way</span>
<span class="tag" v-click="2"><span class="dot-s"></span>we switch with a flag</span>
<span class="tag" v-click="3"><span class="dot-s"></span>same CV shape either way</span>
</div>

<!--
Here is a quick map. The chat sends a message to one API route. A flag picks the backend: workflow or agent.

[click] Both backends show the same CV card and the same Yes/No card.

[click] We switch them with one flag in the request.

[click] And both return the same CV object, checked by the same Zod schema. Same contract — two ways to build it.
-->

---
title: Demo input
path: "/demo/chat"
meta: "§ 04 · the prompt"
status: "§ input"
---

<div class="kicker">the user types this</div>

<h3 class="sub" style="font-size: 52px;">Free-form chat, no form fields.</h3>

<div class="term" style="margin-top: 16px;">
<div class="tbar">
<span class="dots-mini"><i></i><i></i><i></i></span>
<span>chat · new message</span>
</div>
<div class="tbody">
<span class="line"><span class="prompt">user ▍</span> My name is Aleksandr.</span>
<span class="line" style="padding-left: 84px;">20+ years in product architecture — LLM, AI, ML, zero-knowledge security.</span>
<span class="line" style="padding-left: 84px;">At Denovo: consulting for LegalTech and EdTech startups.</span>
<span class="line" style="padding-left: 84px;">Stack: TypeScript, Node, Tauri, Electron, on-device ML, LoRA fine-tuning.</span>
<span class="line" style="margin-top: 18px;" v-click="1"><span class="muted">── goal ──────────────────────────────</span></span>
<span class="line" v-click="1"><span class="muted">output:</span> a structured CV <span style="color: var(--accent)">&#123; name, headline, skills[], jobs[] &#125;</span></span>
</div>
</div>

<p class="body" style="margin-top: 28px; font-size: 22px;" v-click="2">We send this to both backends — and watch how each one gets there.</p>

<!--
The input is just a chat message — like you would describe yourself to a person.

[click] The goal is a typed CV object: name, headline, skills, and jobs.

[click] One trick: I will leave out the company name. Then we see how each backend handles missing data. The workflow asks a question that we wrote in code. The agent decides by itself.
-->

---
title: Demo — workflow backend
path: "/demo/workflow.ts"
meta: "§ 04 · workflow path"
status: "backend · workflow"
---

<div class="kicker">backend a · steps you wire yourself</div>

<h2 class="heading" style="font-size: 64px;">Workflow: extract →<br/>merge → validate → branch.</h2>

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>workflows/cv-workflow.ts</div>

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

<div class="tag-row">
<span class="tag" v-click="1"><span class="dot-s"></span>one LLM call per turn</span>
<span class="tag" v-click="2"><span class="dot-s"></span>cheap — luna for extraction</span>
<span class="tag" v-click="3"><span class="dot-s"></span>branch is code, not the model</span>
</div>

<!--
Backend A — the workflow. It has four steps, connected with createWorkflow from Mastra: extract, merge, validate, and branch.

Extract is the only model call. It uses gpt-6-luna — the cheapest model, with reasoning turned off. Merge is plain code: it keeps what we already know. Validate checks the draft with Zod. Branch is also plain code: it asks about the missing field, or it shows the CV.

[click] So, one model call per message.

[click] A cheap model is enough for simple extraction.

[click] And every path is in our code — no surprises.

>>> LIVE: ⌘K (new conversation) → click the badge to "mode: workflow" → click the first suggestion → Enter <<<

Look at the steps: extract, merge, validate… and it asks: "Which company was that role at?"

>>> Click "The company is Denovo." → Enter → Yes on the card → open the PDF <<<

Every step was visible, and every step was our code.
-->

---
title: Demo — agent backend
path: "/demo/agent.ts"
meta: "§ 04 · agent path"
status: "backend · agent"
---

<div class="kicker">backend b · goal + tools, no script</div>

<h2 class="heading" style="font-size: 64px;">Agent: instructions,<br/>tools, working memory.</h2>

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>agents/cv-agent.ts</div>

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

<div class="tag-row">
<span class="tag" style="border-color: var(--accent-dim); color: var(--accent);" v-click="1"><span class="dot-s"></span>picks its own path</span>
<span class="tag" v-click="2"><span class="dot-s"></span>same CV shape</span>
<span class="tag" v-click="3"><span class="dot-s"></span>webSearch is optional — agent decides</span>
<span class="tag" style="border-color: var(--warn-dim); color: var(--warn);" v-click="4"><span class="dot-s" style="background: var(--warn)"></span>more tokens, less predictable</span>
</div>

<!--
Backend B — the agent. Same task, but no steps. Only instructions, tools, and memory.

The instructions say: extract, validate, confirm, and generate. And one rule: never make the PDF without the user's approval. But this is only a line in a prompt — a soft guardrail. The hard guardrail is in code: generatePdf only accepts a complete, valid CV. In a real app, I would check the approval in code too.

There are five tools. Four of them do the same jobs as the workflow steps. The fifth one is web search. The agent may use it to check a company name. Or it may not. It decides.

[click] The agent chooses the order. There is no branch in our code.

[click] The CV has the same shape as in the workflow.

[click] Web search is optional — the model decides.

[click] The price: more model calls, and less predictable results.

>>> LIVE: ⌘K (new conversation, starts in "mode: agent") → click the first suggestion → Enter <<<

Look at the tool calls: extract, save to memory, validate… It finds the missing company and asks for it.

>>> Click "The company is Denovo." → Enter → point at webSearch if it runs → Yes → PDF <<<

Same input, same PDF — but a different path. More tool calls, more tokens. This is the price of flexibility.
-->

---
title: Working memory
path: "/demo/working-memory"
meta: "§ 04 · state across turns"
status: "§ memory"
layout: split
---

<div class="kicker">what makes the agent feel like a person</div>

<h2 class="heading" style="font-size: 64px;">Schema-backed<br/>memory.</h2>

::left::

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>lib/memory.ts</div>

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

::right::

<p class="lead" style="font-size: 26px; max-width: 36ch;">Mastra injects the current draft into every turn. Agent writes it back via <code>updateWorkingMemory</code>.</p>

<ul class="checks" style="margin-top: 20px;">
<li v-click="1">Turn 1 fills <code>name</code>, <code>skills</code></li>
<li v-click="2">Turn 2 fills the missing company — turn 1 is remembered</li>
<li v-click="3">Turn 3 confirms — agent reads memory, calls <code>generatePdf</code></li>
</ul>

<p class="body" style="margin-top: 24px;" v-click="4"><span style="color: var(--accent)">Same <code>DraftCVSchema</code> the workflow uses.</span></p>

<!--
How did the agent remember my first message? With working memory.

Mastra keeps a draft for each conversation, with the same Zod schema. It gives the draft to the model on every turn. The agent updates it with a built-in tool.

[click] Turn one: the name and the skills.

[click] Turn two: only the new data — the company.

[click] Turn three: "yes". The agent reads the full draft and makes the PDF.

[click] And this is the same schema the workflow uses. One schema keeps both backends in sync.
-->

---
title: Render React in chat
path: "/demo/render-react"
meta: "§ 04 · UI"
status: "§ agent picks UI"
layout: split
---

<div class="kicker">one minute on the UI — this is HelsinkiJS</div>

<h2 class="heading" style="font-size: 60px;">Agent speaks JSON.<br/>React renders.</h2>

::left::

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>tools/ask-confirmation.ts</div>

```ts
outputSchema: z.object({
  // …the tool's normal fields
  ui: z.object({
    type: z.literal("ConfirmCard"),
    props: ConfirmSchema,   // same Zod
  }),
}),
```

<div class="code-bar" style="margin-top: 16px;"><span class="dots-mini"><i></i><i></i><i></i></span>app/page.tsx</div>

```tsx
<Renderer
  spec={{ root: "r", elements: { r: ui } }}
  registry={registry}
/>
```

::right::

<p class="lead" style="font-size: 26px; max-width: 36ch;">Two tools return a <code>ui</code> spec. Agent picks the tool — agent picks the component.</p>

<ul class="checks" style="margin-top: 20px;">
<li v-click="1"><code>validateCV</code> valid → <code>CVCard</code></li>
<li v-click="2"><code>askConfirmation</code> → <code>ConfirmCard</code></li>
<li v-click="3">Unknown type → nothing renders. Fail-safe.</li>
</ul>

<p class="body" style="margin-top: 24px;" v-click="4"><span style="color: var(--accent)">Same Zod schemas</span> — from model output to React props.</p>

<!--
This is HelsinkiJS, so — one minute about the frontend.

The CV card and the Yes/No card are real React components. The model never sends HTML. A tool returns a small spec — a component name and its props. React renders it.

[click] validateCV returns a CVCard.

[click] askConfirmation returns a ConfirmCard.

[click] If the type is unknown, nothing renders. It's safe by default.

[click] So the agent picks the component when it picks the tool. And the same Zod schemas go all the way to the React props.
-->

---
title: Next talk
path: "/next"
meta: "§ end · next talk"
status: "coming next"
class: 'center-v'
---

<div class="kicker">coming next</div>

<h2 class="heading" style="font-size: 120px; line-height: 0.95;">Make Your<br/>Decision<span class="caret"></span></h2>

<p class="lead" style="margin-top: 32px; font-size: 32px; color: var(--fg-dim);">A talk about decision models.</p>

<!--
And one more thing. My next talk is called "Make Your Decision". It's about decision models. I hope to see you there!
-->

---
title: Wrap-up
path: "/wrap-up"
meta: "§ end · Q & A"
status: "end of deck"
---

<div class="kicker">recap</div>

<h2 class="heading" style="font-size: 84px;">One call → a full agent.</h2>

<div class="recap-grid">
<div class="trade" style="font-size: 22px;">
<span class="k">completion</span><span class="v">for predictable steps</span>
<span class="k">structured</span><span class="v">data over text</span>
<span class="k">tools</span><span class="v">the model asks, your code acts</span>
<span class="k">memory</span><span class="v">remembers between turns</span>
<span class="k">agent</span><span class="v">when the path is unknown · mind the risks</span>
</div>
<div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 20px;">
<div class="qr-block"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges" style="width:100%;height:100%;display:block;"><path fill="#ffffff" d="M0 0h37v37H0z"/><path stroke="#000000" d="M4 4.5h7m1 0h1m2 0h3m1 0h4m3 0h7M4 5.5h1m5 0h1m2 0h3m2 0h1m3 0h2m2 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m2 0h1m2 0h1m1 0h2m1 0h1m1 0h1m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m1 0h2m1 0h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h1m1 0h3m1 0h5m3 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m1 0h1m1 0h1m1 0h2m3 0h3m2 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h3m3 0h1m2 0h2m1 0h1M4 12.5h1m3 0h1m1 0h3m4 0h3m1 0h1m1 0h7m2 0h1M4 13.5h1m1 0h3m3 0h2m2 0h2m1 0h2m1 0h1m2 0h8M5 14.5h1m2 0h4m7 0h1m1 0h2m3 0h2m4 0h1M8 15.5h2m1 0h1m1 0h1m1 0h2m2 0h1m1 0h3m2 0h4m1 0h2M5 16.5h2m2 0h10m2 0h1m1 0h3m5 0h1M4 17.5h1m2 0h3m2 0h3m3 0h5m3 0h7M5 18.5h1m1 0h4m2 0h4m1 0h2m2 0h1m1 0h4m1 0h2m1 0h1M4 19.5h2m6 0h2m1 0h1m5 0h1m1 0h3m5 0h2M4 20.5h5m1 0h1m1 0h5m4 0h1m2 0h1m2 0h1m3 0h1M4 21.5h3m1 0h1m2 0h2m3 0h5m1 0h1m1 0h1m1 0h4m1 0h2M6 22.5h1m2 0h2m1 0h2m1 0h2m1 0h2m1 0h1m2 0h1m5 0h1m1 0h1M6 23.5h3m2 0h4m1 0h1m1 0h5m1 0h2m1 0h2m2 0h2M4 24.5h2m3 0h3m1 0h2m2 0h2m2 0h1m2 0h6m2 0h1M12 25.5h3m3 0h3m1 0h3m3 0h1m3 0h1M4 26.5h7m1 0h1m1 0h2m1 0h3m1 0h4m1 0h1m1 0h3m1 0h1M4 27.5h1m5 0h1m2 0h1m1 0h3m3 0h1m1 0h2m3 0h1m2 0h1M4 28.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h2m1 0h1m1 0h1m1 0h7m1 0h1M4 29.5h1m1 0h3m1 0h1m2 0h1m1 0h5m1 0h1m3 0h1m6 0h1M4 30.5h1m1 0h3m1 0h1m2 0h2m1 0h2m1 0h1m3 0h3m3 0h4M4 31.5h1m5 0h1m3 0h6m1 0h1m2 0h3m1 0h2m1 0h2M4 32.5h7m1 0h1m3 0h1m1 0h1m2 0h1m2 0h6m1 0h1"/></svg></div>
<div style="font-size: 18px; color: var(--fg-dim); letter-spacing: 0.08em;">
<div style="color: var(--accent); margin-bottom: 4px;">&gt; scan for the code</div>
github.com/beshkenadze/agents-101
</div>
</div>
</div>

<div class="thanks-row">
<span class="big">Thanks! Find me after the talk.<span class="caret"></span></span>
<span class="sig">@beshkenadze · agents 101</span>
</div>

<!--
Let's wrap up.

Completion — one call, one answer. Great when you know the steps.
Structured output — data, not text.
Tools — the model asks, your code acts.
Memory — the agent remembers between turns.

And an agent is all of this in a loop. Use it when you don't know the path. Start with a workflow, and add an agent when the workflow is not enough.

All the code is in the repo — scan the QR code. Thank you! Find me after the talk.
-->
