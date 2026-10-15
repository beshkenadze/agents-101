// Serves the built slides (./dist) with Bun — no extra dependencies.
// Usage: bun run serve   (after `bun run build`)   or   bun run present
import { join, normalize } from "node:path";

const root = join(import.meta.dir, "..", "dist");
const port = Number(process.env.PORT ?? 3030);

if (!(await Bun.file(join(root, "index.html")).exists())) {
	console.error("No dist/ found. Run `bun run build` first (or `bun run present`).");
	process.exit(1);
}

Bun.serve({
	port,
	async fetch(req) {
		const { pathname } = new URL(req.url);
		// Keep every path inside dist/.
		const rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
		const file = Bun.file(join(root, rel.endsWith("/") ? `${rel}index.html` : rel));
		if (await file.exists()) return new Response(file);
		// Slides use hash routing, so anything else gets the app shell.
		return new Response(Bun.file(join(root, "index.html")));
	},
});

console.log(`Slides:     http://localhost:${port}`);
console.log(`Presenter:  http://localhost:${port}/#/presenter/1`);
console.log("Open both in the same browser — they stay in sync. Ctrl+C to stop.");
