import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { text } from "@pdfme/schemas";
import type { CV } from "@/lib/schemas";

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

export type RenderedCV = { url: string; bytes: number };

export async function renderCVtoPdf(cv: CV): Promise<RenderedCV> {
	const jobsRendered = cv.jobs
		.map(
			(j) =>
				`${j.role} @ ${j.company} · ${j.years}\n${j.highlights.map((h) => `  - ${h}`).join("\n")}`,
		)
		.join("\n\n");

	const pdf = await generate({
		template: cvTemplate,
		inputs: [
			{
				name: cv.name,
				headline: cv.headline,
				skills: cv.skills.join(" · "),
				jobs: jobsRendered,
			},
		],
		plugins: { text },
	});

	const id = crypto.randomUUID().slice(0, 8);
	const dir = join(process.cwd(), "public", "cvs");
	await mkdir(dir, { recursive: true });
	await writeFile(join(dir, `${id}.pdf`), pdf);

	return { url: `/cvs/${id}.pdf`, bytes: pdf.length };
}
