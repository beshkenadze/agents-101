import { createTool } from "@mastra/core/tools";
import { generateObject } from "ai";
import { z } from "zod";
import { model } from "@/lib/ai";
import { SkillsSchema } from "@/lib/schemas";

export const extractSkills = createTool({
	id: "extract-skills",
	description:
		"Extract a flat list of distinct professional skills from free-form text. Use once, early, when you need the candidate's skills.",
	inputSchema: z.object({
		text: z.string().describe("Free-form text from the user about themselves"),
	}),
	outputSchema: SkillsSchema,
	execute: async ({ context }) => {
		const { object } = await generateObject({
			model,
			schema: SkillsSchema,
			prompt: `Extract distinct skills. Skills only — no sentences.\n\n${context.text}`,
		});
		return object;
	},
});
