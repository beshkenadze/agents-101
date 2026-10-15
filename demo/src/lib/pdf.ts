import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDefaultFont, type Schema, type Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { line, rectangle, text } from "@pdfme/schemas";
import { create, type Font } from "fontkit";
import type { CV } from "@/lib/schemas";

// Generated PDFs live outside public/: Next serves public/ only as it was
// at build time, so `next start` would 404 on files written at runtime.
// app/api/cvs/[file]/route.ts serves them from here.
export const CV_DIR = join(tmpdir(), "agents-101-cvs");

// ─── Look ─────────────────────────────────────────────────────
// Dark sidebar + terminal-green accent, like the demo UI.
const SIDEBAR = "#15171a";
const SIDE_TEXT = "#e8e8e3";
const SIDE_MUTED = "#7d7d78";
const SIDE_ACCENT = "#00d68a";
const INK = "#17171a";
const MUTED = "#5d5d5a";
const ACCENT = "#067a3e";

// A4 in mm. pdfme positions everything in mm, font sizes in pt.
const PAGE_W = 210;
const PAGE_H = 297;
const SIDE_W = 64;
const SIDE_X = 12;
const SIDE_TEXT_W = SIDE_W - 2 * SIDE_X;
const MAIN_X = 76;
const MAIN_W = PAGE_W - MAIN_X - 18;
const TOP = 24;
const BOTTOM = 284;
const MM_PER_PT = 25.4 / 72;

// ─── Text measuring ───────────────────────────────────────────
// The page is built in code, not as a fixed template: job lists have any
// length, so every block is measured with the same font pdfme renders
// (Roboto) and the next block starts below it.
let roboto: Font | null = null;
function font(): Font {
	if (roboto) return roboto;
	const data = getDefaultFont().Roboto.data;
	const buf =
		typeof data === "string"
			? Buffer.from(data, "base64")
			: Buffer.from(data as ArrayBuffer);
	roboto = create(buf) as Font;
	return roboto;
}

function widthMm(s: string, size: number, spacing = 0) {
	const f = font();
	const pt =
		(f.layout(s).advanceWidth / f.unitsPerEm) * size +
		spacing * Math.max(0, [...s].length - 1);
	return pt * MM_PER_PT;
}

// Same rule as pdfme: break between words when the line gets too wide.
// 1 mm of slack, so we never count fewer lines than pdfme draws.
function lineCount(s: string, size: number, boxMm: number, spacing = 0) {
	let count = 0;
	for (const para of s.split("\n")) {
		const words = para.split(/\s+/).filter(Boolean);
		let cur = "";
		let lines = 1;
		for (const w of words) {
			const next = cur ? `${cur} ${w}` : w;
			if (cur && widthMm(next, size, spacing) > boxMm - 1) {
				lines++;
				cur = w;
			} else cur = next;
		}
		count += lines;
	}
	return count;
}

// ─── Page builder ─────────────────────────────────────────────
type TextOpts = {
	x: number;
	y: number;
	w: number;
	size: number;
	color: string;
	lineHeight?: number;
	spacing?: number;
	/** Bottom edge for this block; anything below it is left out. */
	limit?: number;
};

class Page {
	schemas: Schema[] = [];
	inputs: Record<string, string> = {};
	/** True when some block did not fit and was left out. */
	clipped = false;
	/** True when the last text() call added its block. */
	added = false;
	private n = 0;

	rect(x: number, y: number, w: number, h: number, color: string) {
		this.schemas.push({
			name: `rect${this.n++}`,
			type: "rectangle",
			position: { x, y },
			width: w,
			height: h,
			color,
			borderColor: color,
			borderWidth: 0,
			readOnly: true,
		} as Schema);
	}

	rule(x: number, y: number, w: number, color: string, thickness = 0.4) {
		this.schemas.push({
			name: `line${this.n++}`,
			type: "line",
			position: { x, y },
			width: w,
			height: thickness,
			color,
			readOnly: true,
		} as Schema);
	}

	/**
	 * Adds a text block and returns its height in mm. A block that would
	 * cross its limit is left out: pdfme would move it to a second page
	 * without the sidebar.
	 */
	text(value: string, o: TextOpts) {
		const lineHeight = o.lineHeight ?? 1.25;
		const spacing = o.spacing ?? 0;
		const lines = lineCount(value, o.size, o.w, spacing);
		const h = (lines * lineHeight * o.size + 0.35 * o.size) * MM_PER_PT;
		this.added = o.y + h <= (o.limit ?? BOTTOM);
		if (!this.added) {
			this.clipped = true;
			return h;
		}
		const name = `t${this.n++}`;
		this.schemas.push({
			name,
			type: "text",
			position: { x: o.x, y: o.y },
			width: o.w,
			height: h,
			fontSize: o.size,
			fontColor: o.color,
			lineHeight,
			characterSpacing: spacing,
			alignment: "left",
			verticalAlignment: "top",
		} as Schema);
		this.inputs[name] = value;
		return h;
	}
}

// Builds the page at a given font scale.
function layout(cv: CV, scale: number) {
	const p = new Page();
	const s = (pt: number) => pt * scale;
	const label = (
		value: string,
		x: number,
		y: number,
		w: number,
		color: string,
	) =>
		p.text(value.toUpperCase(), { x, y, w, size: s(8.5), color, spacing: 1.8 });

	// Sidebar: location, skills, footer.
	p.rect(0, 0, SIDE_W, PAGE_H, SIDEBAR);
	let sy = TOP + 2;
	if (cv.location) {
		sy += label("Location", SIDE_X, sy, SIDE_TEXT_W, SIDE_ACCENT) + 1.5;
		sy +=
			p.text(cv.location, {
				x: SIDE_X,
				y: sy,
				w: SIDE_TEXT_W,
				size: s(10.5),
				color: SIDE_TEXT,
			}) + 10;
	}
	sy += label("Skills", SIDE_X, sy, SIDE_TEXT_W, SIDE_ACCENT) + 2.5;
	const skillsLimit = PAGE_H - 22; // keep clear of the footer
	for (const skill of cv.skills) {
		sy +=
			p.text(skill, {
				x: SIDE_X,
				y: sy,
				w: SIDE_TEXT_W,
				size: s(10.5),
				color: SIDE_TEXT,
				limit: skillsLimit,
			}) + 2.2;
	}
	p.text("cv · generated by agents-101", {
		x: SIDE_X,
		y: PAGE_H - 16,
		w: SIDE_TEXT_W,
		size: 7.5,
		color: SIDE_MUTED,
		limit: PAGE_H,
	});

	// Main column: name, headline, summary, experience.
	let y = TOP;
	y +=
		p.text(cv.name, {
			x: MAIN_X,
			y,
			w: MAIN_W,
			size: s(30),
			color: INK,
			lineHeight: 1.1,
		}) + 2;
	if (cv.headline) {
		y += p.text(cv.headline, {
			x: MAIN_X,
			y,
			w: MAIN_W,
			size: s(13.5),
			color: ACCENT,
			lineHeight: 1.3,
		});
	}
	y += 6;
	p.rule(MAIN_X, y, 16, ACCENT, 0.8);
	y += 9;

	if (cv.summary) {
		y += label("Summary", MAIN_X, y, MAIN_W, MUTED) + 2;
		y +=
			p.text(cv.summary, {
				x: MAIN_X,
				y,
				w: MAIN_W,
				size: s(11),
				color: INK,
				lineHeight: 1.5,
			}) + 10;
	}

	y += label("Experience", MAIN_X, y, MAIN_W, MUTED) + 3;
	for (const job of cv.jobs) {
		// No room for at least the title, company and one line: stop here.
		if (y + 18 > BOTTOM) {
			p.clipped = true;
			break;
		}
		y +=
			p.text(job.role, {
				x: MAIN_X,
				y,
				w: MAIN_W,
				size: s(13.5),
				color: INK,
				lineHeight: 1.2,
			}) + 0.8;
		const meta = [job.company, job.years].filter(Boolean).join("  ·  ");
		y +=
			p.text(meta, { x: MAIN_X, y, w: MAIN_W, size: s(10.5), color: ACCENT }) +
			2.2;
		for (const h of job.highlights ?? []) {
			const hh = p.text(h, {
				x: MAIN_X + 5,
				y,
				w: MAIN_W - 5,
				size: s(10.5),
				color: INK,
				lineHeight: 1.45,
			});
			if (p.added)
				p.text("•", {
					x: MAIN_X + 0.5,
					y,
					w: 4,
					size: s(10.5),
					color: ACCENT,
					lineHeight: 1.45,
				});
			y += hh + 0.8;
		}
		y += 8;
	}

	return p;
}

export type RenderedCV = { url: string; bytes: number };

export async function renderCVtoPdf(cv: CV): Promise<RenderedCV> {
	// Shrink the fonts a little if a long CV does not fit on one page. At the
	// smallest size, whatever still does not fit is left out.
	let page = layout(cv, 1);
	for (let scale = 0.92; page.clipped && scale >= 0.7; scale -= 0.08) {
		page = layout(cv, scale);
	}

	const template: Template = {
		basePdf: { width: PAGE_W, height: PAGE_H, padding: [0, 0, 0, 0] },
		schemas: [page.schemas],
	};
	const pdf = await generate({
		template,
		inputs: [page.inputs],
		plugins: { text, line, rectangle },
	});

	const id = crypto.randomUUID().slice(0, 8);
	await mkdir(CV_DIR, { recursive: true });
	await writeFile(join(CV_DIR, `${id}.pdf`), pdf);

	return { url: `/api/cvs/${id}.pdf`, bytes: pdf.length };
}
