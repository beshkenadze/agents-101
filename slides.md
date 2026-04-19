---
theme: default
title: Agents 101
info: From a simple API call to a working AI agent — step by step.
author: Aleksandr Beshkenadze
presenter: true
download: true
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

[click] The stack is TypeScript, Vercel AI SDK for the models, and Mastra as the agent framework. At the end, we build a CV generator live.
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
Let's start with the simplest thing.

[click] Completion is one call. You send a prompt, you get text back.

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
title: Tools
path: "/02-tools"
meta: "§ 02 · tools"
status: "§ tools"
layout: split
---

<div class="kicker">now we're talking about agents</div>

<h2 class="heading">A tool is a function<br/>the model calls itself.</h2>

::left::

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>tools/get-work-experience.ts</div>

```ts
export const getWorkExperience = tool({
  description: "Get the user's work experience",
  parameters:  z.object({ userId: z.string() }),
  execute: async ({ userId }) => {
    return await db.jobs.findMany({ userId })
  },
})
```

::right::

<ol class="tool-steps">
<li v-click="1"><span class="idx">01</span><span class="t">Model reads the <strong>description</strong>.</span></li>
<li v-click="2"><span class="idx">02</span><span class="t">Decides it fits the task.</span></li>
<li v-click="3"><span class="idx">03</span><span class="t">Fills <strong>parameters</strong> from the Zod schema.</span></li>
<li v-click="4"><span class="idx">04</span><span class="t"><code style="color: var(--accent);">execute()</code> runs. Result goes back.</span></li>
</ol>

<p class="body" style="margin-top: 28px; font-size: 20px;" v-click="5">The agent chooses <em style="color: var(--accent); font-style: normal;">when</em> and <em style="color: var(--accent); font-style: normal;">which</em> tool to call. You don't.</p>

<!--
Now, tools. This is the agent part.

A tool is a function the model can call itself. It has a name, a description, a Zod schema for parameters, and an execute function.

[click] The model reads the description.

[click] It decides the tool fits the task.

[click] It fills the parameters from the Zod schema.

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
<div class="card" v-click="1">
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
<div class="card" v-click="2">
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
<div class="card" v-click="3">
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

<p class="rule-center" v-click="4">In real life you mix them: a workflow step that is an agent with a supervisor inside.</p>

<!--
But one agent is rarely enough. There are three main patterns.

[click] Supervisor. One main agent splits the task and sends parts to other agents. It gets a task, breaks it down, sends parts to a writer agent and a researcher agent, and collects the results. The supervisor makes decisions. The others do the work.

[click] Swarm. Agents work in parallel. No boss. Each does its part. Results merge at the end. Good for tasks that split into independent parts.

[click] Router. One agent only routes. It reads the request and decides who gets it: code goes to a coder agent, text goes to a writer agent. The router does no work itself. It only directs.

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
<span class="line" v-click><span class="muted">output:</span> a structured CV <span style="color: var(--accent)">&#123; name, skills[], jobs[] &#125;</span></span>
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

<div class="kicker">backend a · hardcoded steps</div>

<h2 class="heading" style="font-size: 72px;">Workflow: three<br/>generateObject calls.</h2>

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>workflow.ts</div>

```ts
// step 01 — skills
const skills = await generateObject({ schema: SkillsSchema, prompt })

// step 02 — experience
const jobs   = await generateObject({ schema: JobsSchema,   prompt })

// step 03 — assemble
const cv     = await generateObject({ schema: CVSchema,     prompt: "..." })

return cv  // → { name, skills, jobs }
```

<div class="tag-row">
<span class="tag" v-click="1"><span class="dot-s"></span>sequence visible in code</span>
<span class="tag" v-click="2"><span class="dot-s"></span>cheap</span>
<span class="tag" v-click="3"><span class="dot-s"></span>easy to diff</span>
</div>

<!--
First, the workflow version. It does everything step by step. Step 1 — get the skills. Step 2 — build the job list. Step 3 — put the final object together. Each step is one generateObject call. The sequence is clear, the code is simple.

[click] The sequence is visible in the code.

[click] It is cheap.

[click] And it is easy to diff between runs.
-->

---
title: Demo — agent backend
path: "/demo/agent.ts"
meta: "§ 04 · agent path"
status: "backend · agent"
---

<div class="kicker">backend b · system prompt + tools</div>

<h2 class="heading" style="font-size: 72px;">Agent: a prompt<br/>and two tools.</h2>

<div class="code-bar"><span class="dots-mini"><i></i><i></i><i></i></span>agent.ts</div>

```ts
const cvAgent = agent({
  model: openai("gpt-5"),
  system: "You build structured CVs from free-form chat.",
  tools: { extractSkills, formatExperience },
})

const cv = await cvAgent.run(userMessage)
// agent picks which tool, in what order. same output.
```

<div class="tag-row">
<span class="tag" style="border-color: var(--accent-dim); color: var(--accent);" v-click="1"><span class="dot-s"></span>chooses its own path</span>
<span class="tag" v-click="2"><span class="dot-s"></span>same output shape</span>
<span class="tag" style="border-color: var(--warn-dim); color: var(--warn);" v-click="3"><span class="dot-s" style="background: var(--warn)"></span>more tokens</span>
</div>

<!--
Now the same request — but through an agent. The agent gets two tools: extractSkills and formatExperience. It decides which one to call, and in what order. The result is the same, but the agent picked the path.

[click] It picks its own path.

[click] The output shape is the same.

[click] But we pay more tokens.

The CV generator is actually a good case for a workflow — the steps are known. But if the task grows — say, the agent has to decide to look up the company or to ask the user — then you need an agent.
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
<div class="trade" style="font-size: 24px;">
<span class="k">completion</span><span class="v">for predictable steps</span>
<span class="k">structured</span><span class="v">data over text</span>
<span class="k">tools</span><span class="v">let the agent act</span>
<span class="k">agent</span><span class="v">when the path is unknown · mind the risks</span>
</div>
<div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 20px;">
<div class="qr-block">QR<br/>PLACEHOLDER</div>
<div style="font-size: 18px; color: var(--fg-dim); letter-spacing: 0.08em;">
<div style="color: var(--accent); margin-bottom: 4px;">&gt; scan for repo &amp; docs</div>
github.com/beshkenadze/agents-101
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
