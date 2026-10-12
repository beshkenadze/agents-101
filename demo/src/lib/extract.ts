import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { type DraftCV, DraftCVSchema } from "@/lib/schemas";

// Mechanical extraction — the cheapest, fastest model, with reasoning off.
const extractorModel = openai("gpt-6-luna");

// One structured-output call shared by both backends:
// - the workflow calls it as a fixed step,
// - the agent calls it through the `extractMetadata` tool when it decides to.
export async function extractDraft(text: string): Promise<DraftCV> {
	const { output } = await generateText({
		model: extractorModel,
		output: Output.object({ schema: DraftCVSchema }),
		providerOptions: { openai: { reasoningEffort: "none" } },
		prompt: [
			"Extract CV fields from the message below.",
			"Use null for any field you cannot infer — never invent a name, company, role, or dates.",
			"",
			"Message:",
			text,
		].join("\n"),
	});
	return output;
}
