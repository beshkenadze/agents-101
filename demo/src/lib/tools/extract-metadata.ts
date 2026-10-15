import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { extractDraft } from "@/lib/extract";
import { DraftCVSchema } from "@/lib/schemas";

export const extractMetadata = createTool({
	id: "extract-metadata",
	description:
		"Extract a draft CV (name, headline, location, summary, skills, jobs) from free-form user text in one shot. Fields that cannot be inferred are null. Call at most once per user message.",
	inputSchema: z.object({
		text: z.string().describe("User's original free-form description"),
	}),
	outputSchema: DraftCVSchema,
	execute: async ({ text }) => extractDraft(text),
});
