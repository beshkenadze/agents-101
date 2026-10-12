// Turns archify HTML artifacts into slide-ready SVGs in ../public/diagrams.
//
//   node export.mjs <slug.html>...
//
// For each file: open it headlessly, call archify's own SVG export (dark),
// re-skin it to the deck palette (slide-theme.mjs), then crop the viewBox to
// the drawn content so diagrams fill their slide instead of floating in a
// wide empty canvas.
//
// Needs `playwright` and a Chromium. Set CHROME=/path/to/chrome to use a
// specific binary, and CHROME_ARGS="--no-sandbox ..." for extra flags.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { applySlideTheme } from "./slide-theme.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "..", "public", "diagrams");
const PAD = 12;

const browser = await chromium.launch({
	executablePath: process.env.CHROME || undefined,
	args: process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(" ") : [],
});

async function exportSvg(page, file) {
	await page.goto(`${pathToFileURL(path.resolve(file)).href}?theme=dark`);
	await page.waitForFunction(() => window.Archify?.exportMenu);
	await page.evaluate(() => window.Archify.exportMenu.run("svg"));
	await page.waitForFunction(() => window.__downloads.length > 0, null, {
		timeout: 30000,
	});
	return page.evaluate(() => window.__downloads[0].blob.text());
}

// Union of every visible shape's box, in viewBox units.
async function contentBox(page, svg) {
	await page.setContent(`<body style="margin:0">${svg}</body>`);
	return page.evaluate(() => {
		const root = document.querySelector("svg");
		// Archify's CSS may stretch and center the SVG, so map screen pixels
		// back into viewBox units through the root's own transform.
		const toUser = root.getScreenCTM().inverse();
		const pt = root.createSVGPoint();
		const user = (x, y) => {
			pt.x = x;
			pt.y = y;
			return pt.matrixTransform(toUser);
		};
		let x1 = Infinity,
			y1 = Infinity,
			x2 = -Infinity,
			y2 = -Infinity;
		const shapes = root.querySelectorAll(
			"rect, path, line, polyline, polygon, circle, ellipse, text, use",
		);
		for (const el of shapes) {
			if (el.closest("defs, clipPath, mask, marker, pattern, symbol")) continue;
			if (
				el.classList.contains("c-bg-rect") ||
				el.getAttribute("fill") === "url(#grid)"
			)
				continue;
			const style = getComputedStyle(el);
			if (style.display === "none" || style.visibility === "hidden") continue;
			const r = el.getBoundingClientRect();
			if (r.width === 0 && r.height === 0) continue;
			const a = user(r.left, r.top);
			const b = user(r.right, r.bottom);
			x1 = Math.min(x1, a.x);
			y1 = Math.min(y1, a.y);
			x2 = Math.max(x2, b.x);
			y2 = Math.max(y2, b.y);
		}
		return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
	});
}

const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(() => {
	window.__urls = new Map();
	window.__downloads = [];
	const create = URL.createObjectURL.bind(URL);
	URL.createObjectURL = (blob) => {
		const url = create(blob);
		window.__urls.set(url, blob);
		return url;
	};
	const click = HTMLAnchorElement.prototype.click;
	HTMLAnchorElement.prototype.click = function () {
		if (this.download) {
			window.__downloads.push({ blob: window.__urls.get(this.href) });
			return;
		}
		return click.call(this);
	};
});

fs.mkdirSync(outDir, { recursive: true });
for (const file of process.argv.slice(2)) {
	const slug = path.basename(file, ".html");
	let svg = applySlideTheme(await exportSvg(page, file));
	const box = await contentBox(page, svg);
	const viewBox = [box.x - PAD, box.y - PAD, box.w + 2 * PAD, box.h + 2 * PAD]
		.map((n) => Math.round(n * 10) / 10)
		.join(" ");
	svg = svg.replace(/(<svg[^>]*\sviewBox=")[^"]*"/, `$1${viewBox}"`);
	const out = path.join(outDir, `${slug}.svg`);
	fs.writeFileSync(out, svg);
	console.log(`${path.relative(process.cwd(), out)}  viewBox=${viewBox}`);
}
await browser.close();
