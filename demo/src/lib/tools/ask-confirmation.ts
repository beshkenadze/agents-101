import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const askConfirmation = createTool({
	id: "ask-confirmation",
	description:
		"Surface a structured confirmation to the user. The UI renders { question, proposedValue } as a card with Yes / No buttons; the user's click arrives as their next chat message ('yes' or 'no, <change>'). The tool's output is informational — it echoes what you proposed. Use this for: (a) confirming a guessed field value before locking it in, (b) asking the user to approve final PDF generation.",
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
	}),
	// No requireApproval: this is a structured question, not a pausing tool.
	// The user's response arrives as their next message; the agent reads it
	// on the next turn and decides what to do.
	execute: async (rawInput: unknown) => {
		const input =
			rawInput &&
			typeof rawInput === "object" &&
			"context" in rawInput
				? (rawInput as { context: { field: string; proposedValue: string } })
						.context
				: (rawInput as { field: string; proposedValue: string });
		return { field: input.field, proposedValue: input.proposedValue };
	},
});
