import { openai } from "@ai-sdk/openai";
import { createTool } from "@mastra/core/tools";
import { generateObject } from "ai";
import { z } from "zod";
import { DraftCVSchema } from "@/lib/schemas";

// Mechanical extraction — cheap, fast, non-reasoning.
const extractorModel = openai("gpt-5-nano");

export const extractMetadata = createTool({
	id: "extract-metadata",
	description:
		"Extract a draft CV (name, headline, skills, jobs) from free-form user text in one shot. Any field you cannot infer from the text is simply omitted. Call at most once per user message.",
	inputSchema: z.object({
		text: z.string().describe("User's original free-form description"),
	}),
	outputSchema: DraftCVSchema,
	execute: async ({ context }) => {
		const { object } = await generateObject({
			model: extractorModel,
			schema: DraftCVSchema,
			prompt: [
				"Extract CV fields from the message below.",
				"Omit any field you cannot infer — never invent a name, company, role, or dates.",
				"",
				"Message:",
				context.text,
			].join("\n"),
		});
		return object;
	},
});
