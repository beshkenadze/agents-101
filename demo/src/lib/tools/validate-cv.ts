import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { CVSchema, DraftCVSchema } from "@/lib/schemas";

export const validateCV = createTool({
	id: "validate-cv",
	description:
		"Check whether the current draft CV is complete enough to export. Call this BEFORE generatePdf to get a clear verdict. Pass the draft. Returns { valid: true } when all required fields are present, otherwise { valid: false, issues: [...] } listing what's missing or invalid.",
	inputSchema: DraftCVSchema,
	outputSchema: z.discriminatedUnion("valid", [
		z.object({ valid: z.literal(true) }),
		z.object({ valid: z.literal(false), issues: z.array(z.string()) }),
	]),
	execute: async (input: unknown) => {
		// Mastra passes either the raw input or a wrapped { context } object
		// depending on the code path. Normalise.
		const data =
			input && typeof input === "object" && "context" in input
				? (input as { context: unknown }).context
				: input;

		const result = CVSchema.safeParse(data);
		if (result.success) return { valid: true as const };
		const issues = result.error.issues.map(
			(i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
		);
		return { valid: false as const, issues };
	},
});
