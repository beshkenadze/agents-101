import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { CVSchema, DraftCVSchema } from "@/lib/schemas";

export const validateCV = createTool({
	id: "validate-cv",
	description:
		"Check whether the current draft CV is complete enough to export. Call this BEFORE generatePdf. When valid, the output contains a `ui` spec that renders the CV preview in chat. When invalid, returns the list of missing or wrong fields.",
	inputSchema: DraftCVSchema,
	outputSchema: z.discriminatedUnion("valid", [
		z.object({
			valid: z.literal(true),
			ui: z.object({
				type: z.literal("CVCard"),
				props: CVSchema,
			}),
		}),
		z.object({
			valid: z.literal(false),
			issues: z.array(z.string()),
		}),
	]),
	execute: async (input: unknown) => {
		const data =
			input && typeof input === "object" && "context" in input
				? (input as { context: unknown }).context
				: input;

		const result = CVSchema.safeParse(data);
		if (result.success) {
			return {
				valid: true as const,
				ui: { type: "CVCard" as const, props: result.data },
			};
		}
		const issues = result.error.issues.map(
			(i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
		);
		return { valid: false as const, issues };
	},
});
