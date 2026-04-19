import { createTool } from "@mastra/core/tools";
import { generateObject } from "ai";
import { z } from "zod";
import { model } from "@/lib/ai";
import { JobsSchema } from "@/lib/schemas";

export const formatExperience = createTool({
	id: "format-experience",
	description:
		"Structure work history from free-form text. Returns an array of jobs with company, role, years span, and 2-3 highlights each.",
	inputSchema: z.object({
		text: z.string().describe("Free-form text from the user about themselves"),
	}),
	outputSchema: JobsSchema,
	execute: async ({ context }) => {
		const { object } = await generateObject({
			model,
			schema: JobsSchema,
			prompt: `Extract work experience. For each job: company, role, years span, 2-3 highlight bullets.\n\n${context.text}`,
		});
		return object;
	},
});
