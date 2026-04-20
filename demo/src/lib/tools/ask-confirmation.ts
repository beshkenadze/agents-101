import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ConfirmSchema } from "@/lib/schemas";

export const askConfirmation = createTool({
	id: "ask-confirmation",
	description:
		"Ask the user to confirm or reject a proposed value. The output carries a `ui` spec that renders a ConfirmCard with Yes/No buttons in chat. The user's click arrives as their next message ('yes' or 'no, <change>'). Use this for: (a) confirming a guessed field value before locking it in, (b) asking the user to approve final PDF generation.",
	inputSchema: z.object({
		field: z
			.string()
			.describe(
				"What we're confirming, e.g. 'name', 'company at job 1', or 'generate PDF'",
			),
		question: z.string().describe("Short direct question for the user"),
		proposedValue: z.string().describe("Your best guess / proposed answer"),
	}),
	outputSchema: z.object({
		field: z.string(),
		proposedValue: z.string(),
		ui: z.object({
			type: z.literal("ConfirmCard"),
			props: ConfirmSchema,
		}),
	}),
	execute: async (rawInput: unknown) => {
		const input =
			rawInput && typeof rawInput === "object" && "context" in rawInput
				? (
						rawInput as {
							context: {
								field: string;
								question: string;
								proposedValue: string;
							};
						}
					).context
				: (rawInput as {
						field: string;
						question: string;
						proposedValue: string;
					});
		return {
			field: input.field,
			proposedValue: input.proposedValue,
			ui: {
				type: "ConfirmCard" as const,
				props: {
					field: input.field,
					question: input.question,
					proposedValue: input.proposedValue,
				},
			},
		};
	},
});
