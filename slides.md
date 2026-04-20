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

In 20 minutes we go from one LLM API call to a working agent. We will look at three building blocks: completion, structured output, and tools. Then we put them in a loop. That loop is what makes an agent.

Stack: TypeScript, Vercel AI SDK for the model calls, Mastra as the agent framework.

At the end, we look at a CV-generator demo. Same chat input, two backends. One is a workflow, one is an agent. We compare them. All the code is in the repo behind the QR on the last slide.
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

[click] First — completion. The simplest block. One call in, one string out. Three minutes, because everything else sits on top of it.

[click] Then structured output and tools. Structured output turns text into typed data. Tools turn a model call into an action. I'll also show that a tool call is really just structured output that your code runs.

[click] Next — workflow vs agent. And how to put agents together when one is not enough: supervisor, swarm, router.

[click] Then the live demo. CV generator, two backends, side by side. About eight minutes.

[click] At the end — a one-slide recap, and questions.
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
Let's start with the simplest thing. Completion is one call. You send a prompt, you get text back. That's the atomic unit of everything today.

Here is the AI SDK version. We call generateText. We pass a model — gpt-5 here — and a prompt: "rewrite my work experience nicely". We get a string back.

That is fine for a chat reply. But if the next step is code — building a CV object with fields — a free string is the wrong shape. You would have to parse it. Parsing LLM text is a losing game. We will fix that in two slides with structured output.
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
And this is fine. Completion is not old-fashioned. It is the right tool when the plan is known.

You pack it into a workflow. Step one extracts skills. Step two formats experience. Step three composes the result. You wire the steps. The model fills the blanks in each step.

[click] It is predictable. Every step lives in your code, not in the model. The trace reads top to bottom, like a normal function.

[click] It is cheap. Fewer tokens per step. No tool-calling loop eating turns.

[click] It is easy to debug. Logs at every step. If step two produced garbage, you know where to look.

[click] And it is safe. No surprise tool calls. No off-task detours. The model cannot do anything you did not ask for.

Rule of thumb: if you can split the task into fixed steps, completion in a workflow is enough. You do not need an agent for everything.
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
But sometimes it is different. You don't have a clean flowchart. You did not plan every case. Or you want the model to try something, see an error, and pick a different path. Without you scripting every retry.

This is where an agent appears. Same model. Same completion call under the hood. But wrapped in a loop, and given a set of tools. The model picks a tool. Looks at the result. Decides what to do next. Maybe calls another tool. Maybe answers. Over and over, until it is done.

[click] That loop is where the "agentic" behavior lives. The agent recovers from broken tool calls. It asks the user for missing info. It handles branches you did not plan. The model is still just predicting tokens. But the loop around it makes those predictions feel like decisions.
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
But this flexibility is not free. Let me be concrete.

What you get is real. Agents do recover from broken tool calls. They do ask clarifying questions. They do handle paths you did not plan for. I have seen them fix JSON errors on their own, pick a different tool after a failure, ask the user for a missing date.

[click] What you pay. More tokens per turn — the model reads the tool list every step. Runs are hard to repeat: same input, different tool order, slightly different output. And this one matters most in production — an agent can bypass your guardrails. You ask it to format a CV. It sees the word "dollars". It decides to call your pricing API. Burns budget. Confuses the user. The same freedom that makes it adaptive makes it drift.

[click] Simple rule. Know the steps — workflow. Don't know — agent. Either way, know the risks. In the demo at the end, we run the same task through both. You will see the difference.
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
Before we go deeper into agents, one more piece: structured output. Useful everywhere, not just with agents. Worth a pause.

When a model replies with free text, it is fine for chat. Useless for code. Your next step wants an object with named fields, not a paragraph to parse. generateObject from the AI SDK solves this. You pass a Zod schema. You get a typed object back. No "please respond in JSON" prompt tricks. The SDK handles it.

[click] This works everywhere. Inside a workflow step. As a validation pass. Inside an agent tool. Anywhere you need a predictable output shape. In our demo, the same pattern is used three times — workflow extract step, agent extractMetadata tool, and memory schema. One Zod schema, three call sites.

[click] One honest gotcha: models still break JSON sometimes. Long outputs. Deep nesting. Edge cases. The standard fix is a repair pass. Either plug in a JSON fixer library, or send the broken output to a cheap model — gpt-5-nano or gpt-5-mini — whose only job is "parse this mess, return valid JSON". Two-stage repair. Boring and reliable.
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
One quick bridge before we talk tools. Structured output and tools are much closer than they look.

A tool call is structured output that your code runs. Same mechanism as generateObject. Same Zod engine. Same JSON. The only difference is what happens after.

With generateObject, you get an object. You use it.

With a tool call, the model replies with JSON — "I want to call extractMetadata with this text". Your code looks up the function, runs it, and feeds the result back to the next model turn.

The model never calls anything. It cannot. It is a text generator. All it does is predict the name of a tool and its arguments. Your code does the real work.

[click] Once you see it this way, tools stop being magical. The model asks. Your code calls. Everything else — the loop, the retry, the tool selection — is runtime logic around this simple fact.
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
Now tools. This is where agent behavior lives.

A tool is a function the model can pick from a list. On the left is createTool from Mastra — real code from our demo. Five things: an id, a description, an input Zod schema, an output Zod schema, and an execute function. extractMetadata takes free-form text and returns a DraftCV. The model only sees the description and the schemas. Never the execute body. It decides from that.

[click] The model reads the description. This is the most important part of a tool. Vague description — dead tool. The agent will not pick it. Good descriptions are one-liners: what it does, when to use it.

[click] The model decides if the tool fits the current task. Under the hood, this is a completion call with the tool list in the prompt. Nothing magic.

[click] It fills the inputSchema — same Zod engine as generateObject — with arguments it pulled from context.

[click] execute runs. The return value is fed back to the next model turn as "tool result". The loop continues.

[click] The key point: you do not call the tool. The agent decides when and which. You ship the schema and the execute body, and let go. This is the anxious part when you build your first agent. You wrote the code. But you are not calling it.
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
So — two approaches. When do you pick which? Let me put them side by side.

Workflow: you write the steps yourself. Deterministic. You own every step. Cheaper per turn. Easier to debug — the trace reads like a log file. And a workflow is not dumb. With human-in-the-loop, you can fake a lot of agent-like behavior. The workflow pauses. Asks the user a question. Resumes. That is exactly what our workflow backend does. Control stays with you.

[click] Agent: you give the model a goal and a toolbox. Let it figure out the rest. More adaptive. Recovers, asks, improvises. But it can drift. Go out of scope. Bypass your guardrails. Do things you did not plan. The same freedom that makes it powerful makes it drift.

Simple test. If you can draw a flowchart from start to end — workflow. If the path depends on decisions mid-run — agent. Both are legitimate. You do not need an agent everywhere. Often a workflow with one smart step in the middle is enough.
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
In real products, one agent is rarely enough. You end up putting several together. Three patterns worth knowing.

Supervisor. One lead agent breaks the task down and hands subtasks to specialists. "Write a report" — lead splits it into research, draft, edit. Each goes to a different agent. Lead collects the results. Classic manager-and-team.

Swarm. Agents run in parallel. No lead. Each one works on its own. Results merge at the end. Good for work that splits naturally: "summarize these ten documents" — one agent per document, all running at once.

Router. An agent whose only job is to route. Reads the request. Picks the right specialist. Hands off. Does not execute anything itself.

[click] In practice, you mix them. A workflow of four steps, where step two is a supervisor with three specialists under it. Or a router at the top that sends code questions to one agent and text questions to another. Do not pick one pattern. Pick what each layer needs. And do not get stuck on "which pattern is right" — pick the one that fits the shape of your task.
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
Okay, let's put this all together. I built a small app ahead of time. It is a chat where you describe yourself in free text. The app generates a CV as a PDF.

The twist: there are two different backends under the hood. One is a workflow — the steps we just talked about. The other is an agent — the loop we just talked about. A toggle switches between them. Same chat input. Same final PDF. Very different paths.

Not "live coding" live. All the code is written already. What is live is the comparison. You will see both backends react to the same prompt in real time.
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
Quick map before we open the app.

User types in the chat. Always the same chat. The request goes to one of two backends — workflow or agent — picked by a toggle in the UI. Both return the same CV object: name, headline, skills, jobs. The same Zod schema validates both.

[click] The UI does not know which backend ran. It gets the same streaming events either way — step updates, CV preview, confirm card. The same React components render both.

[click] We switch with a flag in the request. backend = "workflow" or "agent". Nothing else changes. Same message. Same thread id.

[click] The output shape is the same on purpose. That is the whole point. Same input going in. Same CV schema coming out. Very different internals. That is what makes the comparison honest. We are not comparing apples to oranges. We are comparing two ways to build the same contract.
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
The input is free text. Not a form. Not a wizard. Not "paste your LinkedIn URL". Just a chat message, the way you would actually describe yourself.

For the demo I will paste something like this: "My name is Aleksandr. 15+ years in product architecture — LLM, AI, ML, zero-knowledge security. At Denovo: consulting for LegalTech and EdTech startups. Stack: TypeScript, Node, Tauri, Electron, on-device ML, LoRA fine-tuning."

[click] The goal — a typed CV object. Name, headline, skills array, jobs array. Validated against the same Zod schema for both backends.

[click] A small trick on stage. I will send a partial version first — leave out something obvious, like the company name. Then watch how each backend handles the missing field. That is where the two paths differ the most. Workflow hits a code branch and asks a scripted question. Agent runs its loop and decides on its own. Same outcome. Different mechanism. You will see it clearly.
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
Backend A — workflow. Let me walk through the code first, then we switch to the running app.

Four named steps. We wire them with Mastra's createWorkflow. The chain: extract, merge, validate, branch.

Extract is the only LLM call in the whole flow. One generateObject on gpt-5-nano. Cheap. Fast. Non-reasoning. Returns a partial DraftCV — only the fields it could infer from the text.

Merge is pure code. No model. New fields fill empty slots. Already-filled fields are never wiped. That is how state grows across turns.

Validate runs the strict CVSchema through safeParse. Either passes, or returns the first missing field.

Then branch. This is Mastra's .branch() primitive. The predicate is a boolean we computed in validate. Either askStep — pick a question for the missing field. Or readyStep — ask the user to confirm the PDF. The branch is a code switch. Not a model decision.

[click] So per turn — one LLM call only. Everything else is code.

[click] gpt-5-nano is the point here. Mechanical extraction is exactly where cheap models shine. No reasoning needed, just "pull fields out of this text". Using gpt-5 here would cost 10x more with no measurable gain.

[click] The branch is ours. We own every path. Nothing surprises you.

>>> LIVE — switch to the running app <<<

In the chat, check that the toggle says "workflow". Start a new thread. Paste a partial prompt — leave out the company. Something like: "My name is Aleksandr, 15 years in product architecture, TypeScript and ML, consulting for LegalTech startups." Send.

Watch the numbered step blocks appear in order.

Extract — point at it: "one LLM call, gpt-5-nano, returns a DraftCV".
Merge — "pure code, keeping the fields we already have".
Validate — "Zod safeParse, fails because company is missing".
ask-field — "code branch picked the question".

The bot asks "Which company was that at?". Reply "Denovo LLC". Send. Same chain runs again. Extract, merge, validate — this time validate passes. Branch takes readyStep. CV preview card appears. Confirm card with Yes/No.

Click Yes. PDF renders. Download link appears. Open it. There is the CV.

Recap on stage. Every step was visible. Every step was our code. One LLM call per turn. If something had broken, I could point at the exact step.
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
Backend B — agent. Same task. Same CV shape. Completely different structure.

No steps wired by us. Three things: instructions, tools, memory.

The instructions are the agent's job description. Extract fields. Validate them. Confirm with the user. Generate the PDF. And one hard rule: never call generatePdf without explicit approval. That line is our only guardrail against a runaway agent.

Five tools. Four overlap with the workflow. extractMetadata — same one-shot extractor. validateCV — same Zod safeParse. askConfirmation — renders a Yes/No card. generatePdf — renders the file. One extra: webSearch via Firecrawl. It is there if the agent decides it needs to check a company name. Only fires if the agent decides. That word matters.

Memory — per-thread working memory with a Zod schema. We will dig into it on the next slide. For now, know this: the draft survives across turns.

[click] The agent picks the tool order. There is no .branch() in our code. The state machine lives in the instructions — the prompt — not in createWorkflow.

[click] Same output shape as the workflow. validateCV runs the same CVSchema. The CV card uses the same Zod type. The PDF template is the same file.

[click] webSearch is opt-in. The model decides when. Well-known company — maybe skip. Something ambiguous — maybe fire. You cannot predict this. That is the point. That is agent judgement.

[click] The price: more LLM calls per turn. The agent reads the tool list every step. Also more variance — same input twice, tool order can differ, timing differs. This is the trade-off slide from Block 1, made concrete.

>>> LIVE — flip the toggle to agent <<<

Flip the backend toggle in the UI to "agent". Start a fresh thread — memory is per-thread, we want a clean slate. Send the same partial prompt.

Watch the tool blocks stream in. extractMetadata fires — same as workflow's extract. Then updateWorkingMemory — that is Mastra saving the draft into memory. Then validateCV — this time the agent is calling Zod via a tool, not us calling Zod in code. Issue comes back.

The agent decides what to do with the issue. Sometimes it writes a text question directly. Sometimes it calls askConfirmation. Not deterministic. That is the point.

Reply "Denovo LLC". Here is where it gets interesting. Watch for webSearch to fire. The agent may google "Denovo LLC" to check the company name. Sometimes it does. Sometimes it does not. If it does — point at the search results on screen.

Then extractMetadata again with the new message. updateWorkingMemory. validateCV — passes now. askConfirmation — Yes/No card. Click Yes. generatePdf. Same PDF output as backend A.

Key point to call out live. Same input. Same final PDF. But you saw the agent take a different path. More tool calls. Maybe a web search. More tokens on the meter. That is the cost of flexibility, made visible.
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
One more thing. It ties the whole demo together — working memory.

An agent is not just a tool loop. It has state across turns. Mastra gives you this out of the box with the Memory class on the right. Storage can be SQLite, LibSQL, Postgres — whatever. The interesting part is workingMemory. You enable it. You pass a Zod schema. The same DraftCVSchema we use everywhere. Mastra takes the current value and injects it into the prompt at every turn. The agent calls the built-in updateWorkingMemory tool to write changes back.

What this gives you, concretely:

[click] Turn 1. User says "I'm Aleksandr, TypeScript and ML, consulted for legaltech". Agent extracts. Name lands. Skills land. Headline lands. Memory now has those three fields. Jobs is still empty.

[click] Turn 2. User says "at Denovo as consultant since 2024". Agent reads memory. Sees name and skills are already there. Does NOT re-extract them. Pulls only what is new — the jobs info. Writes memory with jobs added. Name and skills untouched. This is the difference between an agent that feels dumb — "wait, what was your name?" — and one that feels coherent.

[click] Turn 3. User says "yes, generate". Agent reads memory. Validates the full CV. Calls generatePdf. Done.

[click] The point that matters most. The same Zod schema is used in three places. Workflow's extract step. Agent's validateCV tool. Mastra's memory config. One source of truth, three call sites. That discipline is what keeps the two backends from drifting apart. Without a shared schema, the workflow would accept CVs the agent rejects. With it, the contract is enforced by the type system.
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
Quick recap. We went from one generateText call to a working agent with memory. Step by step.

Completion — one call in, one string out. Use it when the plan is fixed.

Structured output — so you get typed data, not a paragraph to parse. Plug in a repair pass if JSON breaks.

Tools — structured output that your code runs. This is how the agent acts, not just talks.

Memory — state across turns, backed by a Zod schema. The same schema that validates output also shapes what the agent remembers. One schema, three call sites. That is the spine.

Agent — completion plus tools plus a loop. Use it when the path is not known up front. Remember the costs: more tokens, higher variance, the chance of drift. Start with a workflow. Reach for an agent when the workflow cannot express the task.

QR code — the demo repo. Workflow and agent live side by side, with shared Zod schemas. Links to Mastra and AI SDK docs in the README.

Thanks for listening. Questions.
-->
