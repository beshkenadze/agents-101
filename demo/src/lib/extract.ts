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
			"- headline: a short professional title, e.g. 'AI product architect'.",
			"- summary: one or two sentences in the third person, built only from facts in the message.",
			"- jobs: one entry per job; years as written, e.g. '2022–now' or '2012–2026'.",
			"- highlights: up to 3 short phrases per job, only from the message.",
			"",
			"Message:",
			text,
		].join("\n"),
	});
	return output;
}
