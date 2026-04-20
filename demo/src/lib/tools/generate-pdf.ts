import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { renderCVtoPdf } from "@/lib/pdf";
import { CVSchema } from "@/lib/schemas";

export const generatePdf = createTool({
	id: "generate-pdf",
	description:
		"Render a finalized CV object into a downloadable PDF. Call ONLY after the user explicitly confirms ('yes', 'approve', 'generate') — never without confirmation in the conversation.",
	inputSchema: CVSchema,
	outputSchema: z.object({
		name: z.string(),
		url: z.string().describe("Path under /cvs/... served by Next"),
		bytes: z.number().describe("Size of the generated PDF in bytes"),
	}),
	execute: async (rawInput: unknown) => {
		const input =
			rawInput &&
			typeof rawInput === "object" &&
			"context" in rawInput
				? (rawInput as { context: unknown }).context
				: rawInput;
		const cv = CVSchema.parse(input);
		const { url, bytes } = await renderCVtoPdf(cv);
		return { name: cv.name, url, bytes };
	},
});
