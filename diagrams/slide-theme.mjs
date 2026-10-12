// Re-skins an archify SVG export to match the deck (see ../style.css).
// Used by export.mjs; can also run alone: node slide-theme.mjs <in.svg> <out.svg>
//
// - drops the light-theme media query, so a light OS can't flip the diagram
// - transparent background, no grid: the slide background shows through
// - maps archify's palette onto the deck tokens (accent green, warn amber)
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export function applySlideTheme(source) {
	let svg = source;

	// Remove every `@media (prefers-color-scheme: light) { ... }` block.
	const marker = "@media (prefers-color-scheme: light)";
	for (let i = svg.indexOf(marker); i !== -1; i = svg.indexOf(marker)) {
		let depth = 0;
		let j = svg.indexOf("{", i);
		for (; j < svg.length; j++) {
			if (svg[j] === "{") depth++;
			else if (svg[j] === "}" && --depth === 0) break;
		}
		svg = svg.slice(0, i) + svg.slice(j + 1);
	}

	const deck = {
		bg: "#0a0a0b",
		panel: "#121214",
		line: "#232327",
		fg: "#e8e8e3",
		dim: "#8b8b86",
		faint: "#5a5a56",
		accent: "#00ff9c",
		warn: "#ffb454",
		info: "#7dd3fc",
		violet: "#c4b5fd",
	};
	const tint = (hex, a) => {
		const n = Number.parseInt(hex.slice(1), 16);
		return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
	};

	const overrides = `
:root, svg {
  --bg: transparent; --grid: transparent; --canvas-dot: transparent;
  --text: ${deck.fg}; --text-muted: ${deck.dim}; --text-dim: ${deck.faint}; --text-faint: ${deck.dim};
  --panel: ${tint("#121214", 0.9)}; --panel-border: ${deck.line};
  --lane-fill: ${tint("#121214", 0.55)}; --lane-stroke: ${deck.line};
  --arrow: ${deck.dim}; --arrow-emphasis: ${deck.accent}; --mask: ${deck.bg};
  --backend-fill: ${tint(deck.accent, 0.08)}; --backend-stroke: ${deck.accent};
  --frontend-fill: ${tint(deck.info, 0.1)}; --frontend-stroke: ${deck.info};
  --database-fill: ${tint(deck.violet, 0.1)}; --database-stroke: ${deck.violet};
  --messagebus-fill: ${tint(deck.warn, 0.1)}; --messagebus-stroke: ${deck.warn};
  --cloud-fill: ${tint(deck.warn, 0.1)}; --cloud-stroke: ${deck.warn};
  --security-fill: ${tint(deck.warn, 0.12)}; --security-stroke: ${deck.warn};
  --external-fill: ${tint("#8b8b86", 0.12)}; --external-stroke: ${deck.dim};
}
.c-bg-rect { fill: transparent !important; }
rect[fill="url(#grid)"] { display: none; }
`;
	svg = svg.replace(/<\/style>/, `${overrides}</style>`);

	// Workflow swimlanes span the whole canvas and carry tiny "01 / …" labels.
	// The slide has its own heading, so drop the lane frame and its label.
	svg = svg.replace(
		/<rect[^>]*data-composition-frame-kind="lane"[^>]*\/>\s*<text[^>]*>[^<]*<\/text>/g,
		"",
	);

	// Let the slide decide the size: keep the viewBox, drop fixed pixel sizes.
	svg = svg.replace(/<svg([^>]*)>/, (tag, attrs) => {
		const clean = attrs
			.replace(/\s(width|height)="[^"]*"/g, "")
			.replace(/\sstyle="[^"]*"/, "");
		return `<svg${clean}>`;
	});

	return svg;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [, , input, output] = process.argv;
	fs.writeFileSync(output, applySlideTheme(fs.readFileSync(input, "utf8")));
}
