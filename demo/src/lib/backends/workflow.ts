import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { type CV, CVSchema, JobsSchema, SkillsSchema } from "@/lib/schemas";

export async function runWorkflow(userText: string): Promise<CV> {
	// step 01 — skills
	const { object: skillsObj } = await generateObject({
		model,
		schema: SkillsSchema,
		prompt: `Extract distinct skills from the message below. Skills only — no sentences.\n\n${userText}`,
	});

	// step 02 — experience
	const { object: jobsObj } = await generateObject({
		model,
		schema: JobsSchema,
		prompt: `Extract the user's work experience. For each job: company, role, years span, 2-3 bullet highlights.\n\n${userText}`,
	});

	// step 03 — assemble
	const { object: cv } = await generateObject({
		model,
		schema: CVSchema,
		prompt: [
			"Assemble a final structured CV from the pieces below.",
			`Original message:\n${userText}`,
			`Skills: ${JSON.stringify(skillsObj.skills)}`,
			`Jobs: ${JSON.stringify(jobsObj.jobs)}`,
			"Write a one-line headline. Be terse. Never invent facts.",
		].join("\n\n"),
	});

	return cv;
}
