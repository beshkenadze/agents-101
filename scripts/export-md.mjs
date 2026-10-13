// Exports the deck to one readable Markdown file: what is on each slide,
// what to say (speaker notes), a timing estimate, and version info.
//
//   bun run export:md            → agents-101.md
//
// slides.md stays the source of truth; regenerate after every change.
import { execSync } from "node:child_process";
import fs from "node:fs";
import { parseSync } from "@slidev/parser";
import MarkdownIt from "markdown-it";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const SOURCE = "slides.md";
const OUTPUT = "agents-101.md";
const DECK_URL = "https://beshkenadze.github.io/agents-101/";
const REPO_URL = "https://github.com/beshkenadze/agents-101";
// Calm conference pace for a non-native speaker. Real time also includes
// clicks, pauses and the live demo, so treat totals as a lower bound.
const WORDS_PER_MINUTE = 120;

// Agenda budget per section, in minutes (matches the agenda slide).
const SECTIONS = {
	"00": { name: "Intro & agenda", budget: 1 },
	"01": { name: "Completion vs. agents", budget: 3 },
	"02": { name: "Structured output & tools", budget: 4 },
	"03": { name: "Workflow vs. agent · orchestration", budget: 2 },
	"04": { name: "Live demo — CV generator", budget: 8 },
	end: { name: "Wrap-up", budget: 1 },
};

const git = (cmd) => execSync(`git ${cmd}`, { encoding: "utf8" }).trim();

// ─── Version ────────────────────────────────────────────────
function versionInfo() {
	// Version the deck by the last commit that changed it, so committing this
	// export (or demo code) does not bump the deck version.
	const deckFiles = "-- slides.md style.css public";
	const sha = git(`log -1 --format=%h HEAD ${deckFiles}`);
	const date = git(`log -1 --format=%cs HEAD ${deckFiles}`);
	const branch = git("rev-parse --abbrev-ref HEAD");
	const dirty = git(`status --porcelain ${deckFiles}`) !== "";
	let onMain = false;
	try {
		execSync("git merge-base --is-ancestor HEAD origin/main", {
			stdio: "ignore",
		});
		onMain = true;
	} catch {}
	const history = git(
		"log --no-merges --date=short --format=%ad%x09%h%x09%s HEAD -- slides.md style.css public",
	)
		.split("\n")
		.filter(Boolean)
		.map((line) => line.split("\t"));
	return {
		id: `${date.replaceAll("-", ".")}-${sha}${dirty ? "-dirty" : ""}`,
		sha,
		branch,
		onMain,
		dirty,
		history,
	};
}

// ─── Slide content → Markdown ───────────────────────────────
const md = new MarkdownIt({ html: true });
const td = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
	bulletListMarker: "-",
	emDelimiter: "*",
});
td.use(gfm);

// Turndown's server-side DOM has no classList and non-iterable children.
const hasClass = (node, cls) =>
	node?.nodeType === 1 &&
	(node.getAttribute("class") ?? "").split(/\s+/).includes(cls);
const text = (node) => node.textContent.replace(/\s+/g, " ").trim();
const childrenWith = (node, cls) =>
	Array.from(node.childNodes).filter((child) => hasClass(child, cls));

// Slide headings sit under "### On screen", so push them below that level.
td.addRule("slide-heading", {
	filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
	replacement: (content, node) => {
		const level = Math.min(6, Number(node.nodeName[1]) + 3);
		return `\n\n${"#".repeat(level)} ${content.replace(/\s+/g, " ").trim()}\n\n`;
	},
});
td.addRule("step-number", {
	// The <ol> already numbers these steps; drop the duplicate "01" label.
	filter: (node) =>
		hasClass(node, "idx") &&
		hasClass(node.parentNode?.parentNode, "tool-steps"),
	replacement: () => "",
});
td.addRule("heading-line-breaks", {
	filter: (node) =>
		node.nodeName === "BR" && /^H[1-6]$/.test(node.parentNode?.nodeName),
	replacement: () => " ",
});
td.addRule("kicker", {
	filter: (node) => hasClass(node, "kicker") || hasClass(node, "section-num"),
	replacement: (content) => `\n\n*${content.trim()}*\n\n`,
});
td.addRule("code-bar", {
	filter: (node) => hasClass(node, "code-bar"),
	replacement: (_c, node) => `\n\n\`${text(node)}\`\n`,
});
td.addRule("agenda", {
	filter: (node) => hasClass(node, "agenda-grid"),
	replacement: (_c, node) => {
		const n = childrenWith(node, "n").map(text);
		const item = childrenWith(node, "item").map(text);
		const t = childrenWith(node, "t").map(text);
		return `\n\n${n.map((num, i) => `- ${num} · ${item[i]} — ${t[i]}`).join("\n")}\n\n`;
	},
});
td.addRule("trade", {
	filter: (node) => hasClass(node, "trade"),
	replacement: (_c, node) => {
		const keys = childrenWith(node, "k").map(text);
		const values = childrenWith(node, "v").map(text);
		return `\n\n${keys.map((k, i) => `- **${k}** — ${values[i]}`).join("\n")}\n\n`;
	},
});
td.addRule("checks", {
	filter: (node) =>
		node.nodeName === "LI" && hasClass(node.parentNode, "checks"),
	replacement: (content, node) =>
		`- ${hasClass(node, "minus") ? "−" : "+"} ${content.trim()}\n`,
});
td.addRule("tag", {
	filter: (node) => hasClass(node, "tag"),
	replacement: (_c, node) => ` \`${text(node)}\` `,
});
td.addRule("idx", {
	filter: (node) =>
		(hasClass(node, "idx") || hasClass(node, "col-label")) &&
		!hasClass(node.parentNode?.parentNode, "tool-steps"),
	replacement: (content) => `**${content.trim()}** `,
});
td.addRule("terminal-line", {
	filter: (node) => hasClass(node, "line"),
	replacement: (content) => `${content.trim()}  \n`,
});
td.addRule("terminal-bar", {
	filter: (node) => hasClass(node, "tbar"),
	replacement: (_c, node) => `\n\n\`${text(node)}\`\n\n`,
});
td.addRule("note-box", {
	filter: (node) => hasClass(node, "warn-note"),
	replacement: (content) => `\n\n> ${content.trim()}\n\n`,
});
td.addRule("diagram", {
	filter: (node) => node.nodeName === "IMG" && hasClass(node, "diagram"),
	replacement: (_c, node) => {
		const src = node.getAttribute("src").replace(/^\//, "public/");
		return `\n\n> **Diagram:** ${node.getAttribute("alt")} — [${src.split("/").pop()}](${src})\n\n`;
	},
});
td.addRule("drop-svg", { filter: ["svg"], replacement: () => "" });

function slideToMarkdown(content) {
	const cleaned = content
		.split("\n")
		.filter((line) => !/^::\w+::$/.test(line.trim()))
		.join("\n");
	return td
		.turndown(md.render(cleaned))
		.replace(/\n{3,}/g, "\n\n")
		.replace(/[ \t]+\n/g, (m) => (m.startsWith("  ") ? "  \n" : "\n"))
		.trim();
}

function notesToMarkdown(note = "") {
	return note
		.trim()
		.split("\n")
		.map((line) => {
			const live = line.match(/^>>>\s*(.*?)\s*<<<\s*$/);
			if (live) return `**▶ ${live[1]}**`;
			return line.replace(/\[click\]/g, "**[click]**");
		})
		.join("\n");
}

// ─── Timing ─────────────────────────────────────────────────
const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
const spokenWords = (note = "") =>
	words(note.replace(/^>>>.*<<<$/gm, "").replace(/\[click\]/g, ""));
const seconds = (n) => Math.round((n / WORDS_PER_MINUTE) * 60);
const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const sectionOf = (fm) => fm.meta?.match(/§\s*(\d{2}|end)/)?.[1] ?? "00";

// ─── Build ──────────────────────────────────────────────────
const { slides } = parseSync(fs.readFileSync(SOURCE, "utf8"), SOURCE);
// The first slide's frontmatter doubles as the deck headmatter.
const headmatter = slides[0]?.frontmatter ?? {};
const version = versionInfo();

const rows = slides.map((slide, i) => {
	const fm = slide.frontmatter ?? {};
	const n = spokenWords(slide.note);
	return {
		number: i + 1,
		title: fm.title ?? slide.title ?? `Slide ${i + 1}`,
		path: fm.path,
		section: sectionOf(fm),
		words: n,
		seconds: seconds(n),
		body: slideToMarkdown(slide.content),
		notes: notesToMarkdown(slide.note),
	};
});

const bySection = Object.entries(SECTIONS).map(([key, { name, budget }]) => {
	const list = rows.filter((r) => r.section === key);
	const secs = list.reduce((sum, r) => sum + r.seconds, 0);
	return { key, name, budget, slides: list.map((r) => r.number), secs };
});
const totalSecs = rows.reduce((sum, r) => sum + r.seconds, 0);
const totalBudget = bySection.reduce((sum, s) => sum + s.budget, 0);

const status = version.onMain
	? "Same as `main` — this is what the published deck shows."
	: `Branch \`${version.branch}\`, **not merged to \`main\` yet** — the published deck is older.`;

const out = [];
out.push(`# ${headmatter.title ?? "Agents 101"}`, "");
out.push(`> ${headmatter.info ?? ""}`, "");
out.push("| | |", "|---|---|");
out.push(
	`| **Version** | \`${version.id}\`${version.dirty ? " (uncommitted changes)" : ""} |`,
);
out.push(`| **State** | ${status} |`);
out.push(
	`| **Format** | ${headmatter.meta ?? "20 min"} · ${rows.length} slides |`,
);
out.push(
	`| **Speaker notes** | ${rows.reduce((s, r) => s + r.words, 0)} words ≈ ${clock(totalSecs)} at ${WORDS_PER_MINUTE} wpm (budget ${totalBudget} min) |`,
);
out.push(`| **Slides** | ${DECK_URL} |`);
out.push(`| **Code** | ${REPO_URL} |`);
out.push("");
out.push(
	`*Generated from \`${SOURCE}\` by \`bun run export:md\`. Edit the slides, not this file.*`,
	"",
);

out.push("## Timing", "");
out.push("Notes only — clicks, pauses and the live demo add time on top.", "");
out.push("| Section | Slides | Notes | Budget |", "|---|---|---|---|");
for (const s of bySection) {
	const over = s.secs > s.budget * 60 ? " ⚠️" : "";
	const range = s.slides.length ? `${s.slides[0]}–${s.slides.at(-1)}` : "—";
	out.push(
		`| ${s.key} · ${s.name} | ${range} | ${clock(s.secs)}${over} | ${s.budget}:00 |`,
	);
}
out.push(
	`| **Total** | 1–${rows.length} | **${clock(totalSecs)}** | **${totalBudget}:00** |`,
	"",
);

out.push("## Slides", "");
for (const r of rows) {
	out.push(
		`- [${String(r.number).padStart(2, "0")} · ${r.title}](#slide-${r.number})`,
	);
}
out.push("");

for (const r of rows) {
	out.push("---", "");
	out.push(`<a id="slide-${r.number}"></a>`, "");
	out.push(`## ${String(r.number).padStart(2, "0")} · ${r.title}`, "");
	out.push(
		`\`${r.path ?? ""}\` · notes: ${r.words} words ≈ ${clock(r.seconds)}`,
		"",
	);
	out.push("### On screen", "", r.body || "*(no text)*", "");
	out.push("### Say", "", r.notes || "*(no notes)*", "");
}

out.push("---", "", "## Version history", "");
out.push("Changes to the slides, newest first.", "");
out.push("| Date | Commit | Change |", "|---|---|---|");
for (const [date, sha, subject] of version.history) {
	out.push(
		`| ${date} | [\`${sha}\`](${REPO_URL}/commit/${sha}) | ${subject.replaceAll("|", "\\|")} |`,
	);
}
out.push("");

fs.writeFileSync(OUTPUT, out.join("\n"));
console.log(
	`${OUTPUT}: ${rows.length} slides, version ${version.id}, notes ≈ ${clock(totalSecs)}`,
);
