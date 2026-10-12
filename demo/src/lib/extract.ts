import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { type DraftCV, DraftCVSchema } from "@/lib/schemas";

// Mechanical extraction — cheap, fast, non-reasoning model.
const extractorModel = openai("gpt-5-nano");

// One structured-output call shared by both backends:
// - the workflow calls it as a fixed step,
// - the agent calls it through the `extractMetadata` tool when it decides to.
export async function extractDraft(text: string): Promise<DraftCV> {
	const { output } = await generateText({
		model: extractorModel,
		output: Output.object({ schema: DraftCVSchema }),
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
