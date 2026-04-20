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
Hi, I'm Aleksandr.

In 20 minutes we go from one LLM API call to a working AI agent.

The stack is TypeScript, Vercel AI SDK for the models, and Mastra as the agent framework. At the end, we look at a CV generator demo and compare two backends.
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
<span class="item" v-mark.underline.orange="5">Wrap-up &amp; questions</span>
<span class="t">~1 min</span>
</div>

<!--
Here is the plan.

[click] First — completion. Just one call.

[click] Then structured output and tools. We need them later.

[click] Next — workflow vs agent, and how to put agents together.

[click] And a live demo: a CV generator with two backends.

[click] Wrap-up and questions.
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
  model:  openai("gpt-5"),
  prompt: "Rewrite my work experience nicely.",
})

// → "Aleksandr, 15+ years in product architecture, AI and privacy…"
```

<p class="body" style="margin-top: 32px; font-size: 22px;">Send a prompt. Get a string back. That's it.</p>

<!--
Let's start with the simplest thing. Completion is one call. You send a prompt, you get text back.

Here is the AI SDK. We call generateText, we pass a model, and we pass a prompt: "rewrite my work experience nicely". We get a string. That's it.
-->

---
title: Completion in workflow
path: "/01-completion/workflow"
meta: "§ 01 · workflow"
status: "§ workflow"
---

<div class="kicker">if you can draw the flowchart — ship it</div>

<h2 class="heading" style="font-size: 76px;">Completion shines<br/>inside a workflow.</h2>

<div class="two-ascii-trade">
<div>
<pre class="ascii" style="font-size: 26px; line-height: 1.6;"><b>step 01</b>  <em>→</em>  extract skills
<b>step 02</b>  <em>→</em>  format experience
<b>step 03</b>  <em>→</em>  compose final object</pre>
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
And this is fine. Completion works great inside a workflow — when the steps are known, and you wire them yourself: call this, then that, then format.

[click] It is predictable — every step is in your code.

[click] It is cheap — fewer tokens, fewer round-trips.

[click] It is easy to debug — you have logs at every step.

[click] And it is safe — no surprise tool calls.

If you can split the task into fixed steps, completion is enough.
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
<pre class="ascii" style="font-size: 28px; line-height: 1.7;">  ┌──────────┐
  │  model   │ ◀──┐
  └────┬─────┘    │
       │ picks    │
       ▼          │
  ┌──────────┐    │
  │  tool    │ ───┘ <em>loop</em>
  └──────────┘
<span class="warn" style="display:block; margin-top:1.2em;">  same model + tools + loop</span></pre>
<div>
<p class="lead" style="max-width: 32ch; font-size: 32px;">The model chooses which function to call, inspects the result, and decides what to do next.</p>
<p class="body" style="margin-top: 20px;" v-click>It can recover from errors, ask for missing info, and handle scenarios you didn't plan for.</p>
</div>
</div>

<!--
But sometimes it is different. You don't have a clear plan. You didn't think about every case. You want the model to decide what to do next — or to try, see an error, and try another way.

This is where an agent comes in. Same model, but with tools and a loop. It picks a function, looks at the result, and decides the next step.

[click] It can recover from errors, ask for missing info, and handle cases you did not plan for.
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
<li class="minus">Can bypass guardrails &amp; drift off-task</li>
</ul>
</div>
</div>

<p class="rule-center" v-click><span style="color: var(--accent)">Know your steps?</span> → workflow. &nbsp;·&nbsp; <span style="color: var(--warn)">Don't?</span> → agent. &nbsp;·&nbsp; Either way: <span style="color: var(--fg);">know the risks</span>.</p>

<!--
But flexibility has a price.

[click] More tokens, less predictable behavior. And important: an agent can bypass your guardrails and go off-task. It can do things you did not plan.

[click] Simple rule: if you know the steps, use a workflow with completion. If you don't, use an agent. Either way — keep the risks in mind.
-->

---
title: Structured output
path: "/02-structured"
meta: "§ 02 · structured output"
status: "§ generateObject"
layout: split
---

<div class="kicker">useful everywhere — not just for agents</div>

<h2 class="heading" style="font-size: 80px;">Objects, not<br/>paragraphs.</h2>

::left::

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>extract.ts</div>

```ts
const { object } = await generateObject({
  model:  openai("gpt-5"),
  schema: z.object({
    name:   z.string(),
    skills: z.array(z.string()),
    years:  z.number().min(0),
  }),
  prompt: userText,
})

// object is fully typed. no parsing.
```

::right::

<p class="lead" style="font-size: 30px; max-width: 32ch;">Give the model a Zod schema. Get a typed object back.</p>

<p class="body" style="margin-top: 16px;" v-click>Works in workflows, in validation, inside agents — anywhere you need a predictable output shape.</p>

<div class="warn-note" v-click>
<strong>// heads up:</strong> models occasionally break JSON. Plug in a fixer, or re-send to a cheap model (nano / mini) for repair.
</div>

<!--
Before we go deeper into agents, one useful thing: structured output.

When a model replies with free text, it is fine for chat — but not for code. You need an object with clear fields, not a paragraph. generateObject from the AI SDK solves this. You pass a Zod schema, you get a typed object back.

[click] It works everywhere — in workflows, in validation, inside agents. Anywhere you need a predictable output shape.

[click] One gotcha: models sometimes break the JSON. It happens. You can plug in a JSON fixer, or send the broken answer to a cheap model — nano or mini — to repair it.
-->

---
title: Tool calls are structured output
path: "/02-structured/tool-call"
meta: "§ 02 · the bridge"
status: "§ bridge"
---

<div class="kicker">how structured output and tools connect</div>

<h2 class="heading" style="font-size: 68px;">A tool call is<br/>structured output + execute.</h2>

<pre class="ascii" style="font-size: 22px; line-height: 1.7; margin-top: 24px;">  <span style="color: var(--fg-dim);">model reply (structured):</span>
    { "tool": "extractMetadata", "args": { "text": "I'm Aleksandr..." } }
                            <em>│</em>
                            <em>▼</em>
  <span style="color: var(--fg-dim);">runtime executes:</span>  extractMetadata({ text: "I'm Aleksandr..." })
                            <em>│</em>
                            <em>▼</em>
  <span style="color: var(--fg-dim);">result →</span>  next model call</pre>

<p class="body" style="margin-top: 32px; font-size: 24px;" v-click>The model doesn't <em style="color: var(--accent); font-style: normal;">call</em> anything — it <strong>asks</strong> in JSON. Your code calls.</p>

<!--
Quick bridge between structured output and tools.

A tool call is just structured output that the runtime executes. The model reads the tool description and the parameter schema, and returns JSON: "I want to call this tool with these params". The model itself does not call anything. Your code does.

This is why tools look like generateObject under the hood — same engine, same Zod. The runtime then executes the function and feeds the result back.

[click] Remember: the model asks, your code calls.
-->

---
title: Tools
path: "/02-tools"
meta: "§ 02 · tools"
status: "§ tools"
layout: split
---

<div class="kicker">now we're talking about agents</div>

<h2 class="heading">A tool is a function<br/>the model calls itself.</h2>

::left::

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>tools/extract-metadata.ts</div>

```ts
export const extractMetadata = createTool({
  id:           "extract-metadata",
  description:  "Extract a draft CV from free-form user text.",
  inputSchema:  z.object({ text: z.string() }),
  outputSchema: DraftCVSchema,
  execute: async ({ context }) => {
    const { object } = await generateObject({
      model:  openai("gpt-5-nano"), // cheap — structured extraction
      schema: DraftCVSchema,
      prompt: `Extract from: ${context.text}`,
    })
    return object
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
Now, tools. This is the agent part.

A tool is a function the model can call itself. It has a name, a description, a Zod schema for parameters, and an execute function.

[click] The model reads the description.

[click] It decides the tool fits the task.

[click] It fills the inputSchema — the Zod schema — with arguments.

[click] Execute runs, and the result goes back to the model.

[click] Key point: the agent picks when and which tool to use. You, the developer, do not control this directly.
-->

---
title: Workflow vs agent
path: "/03-orchestration"
meta: "§ 03 · workflow vs agent"
status: "§ choose wisely"
---

<div class="kicker">one rule of thumb</div>

<h2 class="heading" style="font-size: 72px;">Flowchart fits? Workflow.<br/>Depends on the run? Agent.</h2>

<div class="split" style="margin-top: 16px;">
<div class="col">
<span class="col-label">workflow</span>
<h3>You wire the steps.</h3>
<ul class="checks">
<li>Deterministic — you control each step</li>
<li>Cheaper · easier to debug</li>
<li>Human-in-the-loop can emulate agent-like behaviour</li>
</ul>
<pre class="ascii" style="margin-top: auto; padding-top: 28px; font-size: 20px; color: var(--fg-dim);">  ┌──┐   ┌──┐   ┌──┐
  │01│ → │02│ → │03│
  └──┘   └──┘   └──┘</pre>
</div>
<div class="col pill-accent" v-click>
<span class="col-label">agent</span>
<h3 style="color: var(--accent);">You give it a goal.</h3>
<ul class="checks">
<li>Adaptive — recovers &amp; improvises</li>
<li>Asks for data it doesn't have</li>
<li class="minus">May drift, bypass guardrails</li>
</ul>
<pre class="ascii" style="margin-top: auto; padding-top: 28px; font-size: 20px;">       ┌──────┐
  goal→│ loop │→ tools
       └──┬───┘
          └──── self-decides</pre>
</div>
</div>

<!--
So, two approaches. When do you pick which one?

Workflow is when you write the steps yourself. Deterministic — you control every step. Cheaper. Easier to debug. And a workflow is not "dumb" — with human-in-the-loop you can copy agent behavior: the workflow stops, asks the user, then continues. You keep control.

[click] An agent is when you give the model a goal and a set of tools, and it does the rest. It is more adaptive: it recovers from errors, it asks for missing data, it handles cases you did not plan. But there is a risk — the agent can go out of scope, bypass your guardrails, and do things you did not want.

Simple rule: if you can draw a flowchart from start to end — workflow. If the path depends on decisions along the way — agent. You do not need an agent everywhere.
-->

---
title: Orchestration patterns
path: "/03-orchestration/patterns"
meta: "§ 03 · patterns"
status: "§ orchestration"
---

<div class="kicker">one agent is rarely enough</div>

<h2 class="heading" style="font-size: 72px; margin-bottom: 24px;">Three ways to compose.</h2>

<div class="tri">
<div class="card">
<span class="idx">01 · supervisor</span>
<h4>Supervisor</h4>
<p>One lead agent breaks the task down and dispatches to specialists.</p>
<pre class="ascii" style="margin-top: auto; padding-top: 16px; font-size: 18px; color: var(--fg-dim);">       ┌───────┐
       │ lead  │
       └─┬───┬─┘
        ▼    ▼
      ┌──┐  ┌──┐
      │A │  │B │
      └──┘  └──┘</pre>
</div>
<div class="card">
<span class="idx">02 · swarm</span>
<h4>Swarm</h4>
<p>Agents run in parallel. No boss. Results merge at the end.</p>
<pre class="ascii" style="margin-top: auto; padding-top: 16px; font-size: 18px; color: var(--fg-dim);">  ┌──┐ ┌──┐ ┌──┐
  │A │ │B │ │C │
  └─┬┘ └─┬┘ └─┬┘
    └────┼────┘
         ▼
       merge</pre>
</div>
<div class="card">
<span class="idx">03 · router</span>
<h4>Router</h4>
<p>Reads the request, hands it to the right specialist. Doesn't execute.</p>
<pre class="ascii" style="margin-top: auto; padding-top: 16px; font-size: 18px; color: var(--fg-dim);">       ┌────────┐
  req→ │ router │
       └──┬──┬──┘
          ▼  ▼
        code  text</pre>
</div>
</div>

<p class="rule-center" v-click>In real life you mix them: a workflow step that is an agent with a supervisor inside.</p>

<!--
But one agent is rarely enough. There are three main patterns — look at them side by side.

Supervisor: one lead agent splits the task and sends parts to specialists. The lead decides, the others do the work.

Swarm: agents run in parallel, no boss, results merge at the end. Good for independent sub-tasks.

Router: one agent only routes — reads the request, picks the specialist. It doesn't do the work itself.

[click] In practice, we mix these. A workflow with a few steps, where one step is an agent with a supervisor inside. You don't have to pick only one.
-->

---
title: Demo — CV generator
path: "/demo/cv-generator"
meta: "§ 04 · live"
status: "live · recording"
class: 'center-v'
---

<div class="section-num">§ 04 — DEMO</div>

<h2 class="heading" style="font-size: 140px; line-height: 0.9;">Let's<br/>build<br/>a CV gen<span class="caret"></span></h2>

<p class="body" style="margin-top: 40px; font-size: 28px; max-width: 60ch; color: var(--fg-dim);">Same chat input. Two backends — workflow and agent. We compare.</p>

<!--
Okay, let's put it all together. I wrote a small app — a chat where you can generate a CV. Under the hood there are two backends: one uses a workflow, the other uses an agent. I will show both, and we will compare.
-->

---
title: Demo architecture
path: "/demo/architecture"
meta: "§ 04 · two paths"
status: "§ two backends"
---

<div class="kicker">same input · same output · two paths</div>

<h2 class="heading" style="font-size: 64px;">One chat,<br/>two backends.</h2>

<pre class="ascii" style="font-size: 22px; line-height: 1.8; margin-top: 24px;">                         <span style="color: var(--accent);">A · workflow</span>  <em>→</em>  step · step · branch    <em>─┐</em>
  free-form chat  <em>──┤</em>                                              <em>├──▶</em>  { name, headline, skills, jobs }
                         <span style="color: var(--accent);">B · agent</span>     <em>→</em>  tools + loop + memory   <em>─┘</em></pre>

<div class="tag-row" style="margin-top: 32px;">
<span class="tag" v-click="1"><span class="dot-s"></span>UI doesn't know which backend ran</span>
<span class="tag" v-click="2"><span class="dot-s"></span>we switch with a flag</span>
<span class="tag" v-click="3"><span class="dot-s"></span>same CV shape either way</span>
</div>

<!--
Quick look at the app before we open the code.

The user types in the chat. The request goes to one of two backends — workflow or agent. Both return the same CV object: name, skills, jobs.

[click] The UI doesn't know which backend ran.

[click] We switch with a flag in the request.

[click] The output shape is identical. That's what lets us compare fairly — same input, same output, different paths.
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
<span class="line" style="padding-left: 84px;">15+ years in product architecture — LLM, AI, ML, zero-knowledge security.</span>
<span class="line" style="padding-left: 84px;">At Denovo: consulting for LegalTech and EdTech startups.</span>
<span class="line" style="padding-left: 84px;">Stack: TypeScript, Node, Tauri, Electron, on-device ML, LoRA fine-tuning.</span>
<span class="line" style="margin-top: 18px;" v-click><span class="muted">── goal ──────────────────────────────</span></span>
<span class="line" v-click><span class="muted">output:</span> a structured CV <span style="color: var(--accent)">&#123; name, headline, skills[], jobs[] &#125;</span></span>
</div>
</div>

<p class="body" style="margin-top: 28px; font-size: 22px;" v-click>Same input below. Watch how the two backends reach the same object differently.</p>

<!--
The user writes in the chat in free form: "My name is Aleksandr. 15+ years in product architecture — LLM, AI, ML, zero-knowledge security. At Denovo: consulting for LegalTech and EdTech startups. Stack: TypeScript, Node, Tauri, Electron, on-device ML, LoRA fine-tuning."

[click] The goal — a structured CV: name, skills as an array, jobs as an array.

[click] We send the same input to both backends. Let's watch the two paths.
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
  .then(extract)    // 1 × generateObject → DraftCVSchema · gpt-5-nano
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
<span class="tag" v-click="2"><span class="dot-s"></span>cheap — nano for extraction</span>
<span class="tag" v-click="3"><span class="dot-s"></span>branch is code, not the model</span>
</div>

<!--
Backend A — workflow. Four named steps, wired by us with Mastra's createWorkflow.

Extract is the only LLM call — generateObject on a cheap nano model, returns a partial draft. Merge is pure code: new fields fill empty slots, filled fields are never wiped. Validate runs the strict CVSchema through safeParse. Then branch — that's a code-level switch, not the model deciding — either we ask the user for the missing field, or we confirm and render the PDF.

[click] One LLM call per turn — all orchestration is code.

[click] We use gpt-5-nano for extraction. Mechanical structured output is where cheap models shine.

[click] The branch is deterministic — we own every fork.

This is interactive by the way: state lives across turns, so a missing field is asked, not hallucinated.
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
  model: "openai/gpt-5-mini",
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
Backend B — agent. Same task, same CV shape. But instead of wiring steps, we give the model instructions, five tools, and per-thread memory.

The tools cover the same ground as the workflow plus a couple of extras: extractMetadata is the same one-shot extractor, validateCV runs Zod, askConfirmation asks the user about a field, generatePdf renders the file — and webSearch is only called if the model decides it needs it. For example, "Denovo LLC" — it may google to verify the company.

[click] The agent chooses the order. No branch in our code.

[click] The output shape is the same — we validate against CVSchema either way.

[click] webSearch is opt-in — only fires when the model thinks it's worth the tokens. That's the agent judgement call.

[click] And we pay for it: more tokens, higher variance between runs.

Both backends reach the same PDF. Workflow is cheaper and predictable. Agent is flexible.
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
<li v-click="2">Turn 2 fills <code>jobs</code> — turn 1 is remembered</li>
<li v-click="3">Turn 3 confirms — agent reads memory, calls <code>generatePdf</code></li>
</ul>

<p class="body" style="margin-top: 24px;" v-click="4">Same <code>DraftCVSchema</code> the workflow uses. <span style="color: var(--accent)">One Zod schema, three call-sites.</span></p>

<!--
One more thing worth showing — working memory.

The agent isn't just a loop, it has persistent state across turns. Mastra gives you this out of the box: you set a Zod schema — same DraftCVSchema we use everywhere — and Mastra injects the current draft into the prompt every turn. The agent calls updateWorkingMemory to write changes back.

[click] Turn 1 the user says "I'm Aleksandr, TypeScript and ML" — name and skills land in memory.

[click] Turn 2 "at Denovo as consultant since 2024" — jobs gets added, name and skills are still there, agent doesn't re-extract them.

[click] Turn 3 "yes generate" — agent reads memory, validates, calls generatePdf.

[click] Notice: same Zod schema is used by the workflow's extract step, by the validate tool, and as the memory schema. One source of truth. That's what makes the whole thing hold together.
-->

---
title: Wrap-up & Q&A
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
<span class="k">tools</span><span class="v">let the agent act</span>
<span class="k">memory</span><span class="v">one Zod schema, many call-sites</span>
<span class="k">agent</span><span class="v">when the path is unknown · mind the risks</span>
</div>
<div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 20px;">
<div class="qr-block"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges" style="width:100%;height:100%;display:block;"><path fill="#ffffff" d="M0 0h37v37H0z"/><path stroke="#000000" d="M4 4.5h7m3 0h2m1 0h4m2 0h1m2 0h7M4 5.5h1m5 0h1m1 0h1m1 0h2m1 0h8m1 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m2 0h3m3 0h2m1 0h1m1 0h1m1 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m3 0h2m3 0h2m1 0h1m3 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h1m1 0h3m2 0h1m1 0h3m2 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m3 0h1m2 0h1m1 0h1m1 0h1m1 0h2m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M13 11.5h1m1 0h1m1 0h5m2 0h1M4 12.5h1m1 0h1m1 0h1m1 0h1m3 0h1m2 0h2m2 0h1m2 0h1m3 0h1m2 0h1M5 13.5h1m2 0h1m2 0h2m1 0h5m1 0h3m1 0h3m2 0h1m2 0h1M7 14.5h1m1 0h2m2 0h1m4 0h1m1 0h1m3 0h1m3 0h1m1 0h3M5 15.5h2m1 0h1m2 0h1m5 0h1m2 0h3m1 0h1m1 0h3m2 0h1M4 16.5h1m1 0h1m2 0h2m1 0h2m3 0h5m1 0h4m2 0h1m1 0h2M4 17.5h1m3 0h1m2 0h8m1 0h2m3 0h2m2 0h1m2 0h1M4 18.5h7m1 0h2m4 0h1m2 0h2m2 0h3m1 0h1m1 0h2M4 19.5h1m4 0h1m3 0h1m3 0h5m1 0h2m2 0h1m1 0h1m1 0h1M5 20.5h1m1 0h7m2 0h3m1 0h3m1 0h4m1 0h1m1 0h2M9 21.5h1m4 0h1m1 0h1m3 0h1m3 0h3m2 0h2m1 0h1M4 22.5h1m3 0h3m3 0h1m1 0h2m3 0h1m2 0h2m1 0h2m2 0h2M5 23.5h1m1 0h1m3 0h1m1 0h1m1 0h4m1 0h2m3 0h2m2 0h1m1 0h1M4 24.5h1m3 0h4m1 0h1m2 0h1m1 0h1m1 0h2m1 0h6M12 25.5h1m1 0h2m4 0h1m3 0h1m3 0h1m1 0h3M4 26.5h7m2 0h1m1 0h3m4 0h3m1 0h1m1 0h2m1 0h2M4 27.5h1m5 0h1m8 0h1m1 0h2m1 0h1m3 0h2M4 28.5h1m1 0h3m1 0h1m1 0h5m3 0h2m2 0h5M4 29.5h1m1 0h3m1 0h1m2 0h1m1 0h3m2 0h1m2 0h1m3 0h2m1 0h3M4 30.5h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h2m2 0h1m1 0h2m2 0h3m2 0h1M4 31.5h1m5 0h1m4 0h1m1 0h1m2 0h6m1 0h2m2 0h1M4 32.5h7m1 0h1m1 0h4m1 0h8m1 0h1m2 0h2"/></svg></div>
<div style="font-size: 18px; color: var(--fg-dim); letter-spacing: 0.08em;">
<div style="color: var(--accent); margin-bottom: 4px;">&gt; scan for the deck</div>
beshkenadze.github.io/agents-101
</div>
</div>
</div>

<div class="thanks-row">
<span class="big">Thanks. Questions?<span class="caret"></span></span>
<span class="sig">@beshkenadze · agents 101</span>
</div>

<!--
Let's recap. We went from a single generateText call to a working agent.

Completion — for predictable steps.
Structured output — to get data, not text.
Tools — so the agent can act.
Agent — when the path is not known in advance. But remember the risks.

The demo repo is behind the QR code — all the code is there. The Mastra and AI SDK docs are in the README.

Thanks! Questions?
-->
