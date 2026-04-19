import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { text } from "@pdfme/schemas";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { CVSchema } from "@/lib/schemas";

const cvTemplate: Template = {
	basePdf: { width: 210, height: 297, padding: [14, 14, 14, 14] },
	schemas: [
		[
			{
				name: "name",
				type: "text",
				position: { x: 14, y: 18 },
				width: 182,
				height: 10,
				fontSize: 22,
			},
			{
				name: "headline",
				type: "text",
				position: { x: 14, y: 30 },
				width: 182,
				height: 8,
				fontSize: 12,
			},
			{
				name: "skills",
				type: "text",
				position: { x: 14, y: 44 },
				width: 182,
				height: 20,
				fontSize: 10,
			},
			{
				name: "jobs",
				type: "text",
				position: { x: 14, y: 70 },
				width: 182,
				height: 200,
				fontSize: 10,
			},
		],
	],
};

export const generatePdf = createTool({
	id: "generate-pdf",
	description:
		"Render a finalized CV object into a PDF and return the public URL. Only use after the CV is assembled.",
	inputSchema: CVSchema,
	outputSchema: z.object({
		name: z.string(),
		url: z.string().describe("Path under /cvs/... served by Next"),
		bytes: z.number().describe("Size of the generated PDF in bytes"),
	}),
	execute: async ({ context }) => {
		const jobsRendered = context.jobs
			.map(
				(j) =>
					`${j.role} @ ${j.company} · ${j.years}\n${j.highlights.map((h) => `  - ${h}`).join("\n")}`,
			)
			.join("\n\n");

		const pdf = await generate({
			template: cvTemplate,
			inputs: [
				{
					name: context.name,
					headline: context.headline,
					skills: context.skills.join(" · "),
					jobs: jobsRendered,
				},
			],
			plugins: { text },
		});

		const id = crypto.randomUUID().slice(0, 8);
		const dir = join(process.cwd(), "public", "cvs");
		await mkdir(dir, { recursive: true });
		await writeFile(join(dir, `${id}.pdf`), pdf);

		return {
			name: context.name,
			url: `/cvs/${id}.pdf`,
			bytes: pdf.length,
		};
	},
});
