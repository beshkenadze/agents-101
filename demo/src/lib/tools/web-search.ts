import { createTool } from "@mastra/core/tools";
import Firecrawl from "@mendable/firecrawl-js";
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
	execute: async ({ query }) => {
		const apiKey = process.env.FIRECRAWL_API_KEY;
		if (!apiKey) return { results: [] };

		const app = new Firecrawl({ apiKey });
		const res = await app.search(query, { limit: 3 });

		return {
			results: (res.web ?? []).map((r) => {
				// Results are either light search hits or full scraped documents.
				const hit = "description" in r || "title" in r ? r : undefined;
				const doc = "metadata" in r || "markdown" in r ? r : undefined;
				return {
					title: hit?.title ?? doc?.metadata?.title ?? "",
					url: hit?.url ?? doc?.metadata?.sourceURL ?? "",
					snippet: (hit?.description ?? doc?.markdown ?? "").slice(0, 240),
				};
			}),
		};
	},
});
