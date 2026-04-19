import Firecrawl from "@mendable/firecrawl-js";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const SearchResultSchema = z.object({
	title: z.string(),
	url: z.string(),
	snippet: z.string(),
});

export const webSearch = createTool({
	id: "web-search",
	description:
		"Search the web (top 3 results). Use sparingly — only when the user mentions a company or fact you can't verify from context.",
	inputSchema: z.object({
		query: z.string().describe("Focused search query, 3-8 words"),
	}),
	outputSchema: z.object({ results: z.array(SearchResultSchema) }),
	execute: async ({ context }) => {
		const apiKey = process.env.FIRECRAWL_API_KEY;
		if (!apiKey) {
			return { results: [], note: "FIRECRAWL_API_KEY missing — skipped" };
		}

		const app = new Firecrawl({ apiKey });
		const res = await app.search(context.query, { limit: 3 });

		const web = res.data?.web ?? [];
		return {
			results: web.map((r) => ({
				title: r.title ?? "",
				url: r.url ?? "",
				snippet: (r.description ?? r.markdown ?? "").slice(0, 240),
			})),
		};
	},
});
