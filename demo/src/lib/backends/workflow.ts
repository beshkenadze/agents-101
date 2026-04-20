import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { renderCVtoPdf } from "@/lib/pdf";
import { type CV, CVSchema, JobsSchema, SkillsSchema } from "@/lib/schemas";

export type WorkflowEvent =
	| { kind: "step-start"; step: 1 | 2 | 3 | 4; label: string }
	| { kind: "step-done"; step: 1 | 2 | 3 | 4; data: unknown }
	| { kind: "final"; cv: CV; pdf: { url: string; bytes: number } }
	| { kind: "error"; message: string };

export async function* runWorkflow(
	userText: string,
): AsyncGenerator<WorkflowEvent, void, void> {
	try {
		yield { kind: "step-start", step: 1, label: "extracting skills" };
		const { object: skillsObj } = await generateObject({
			model,
			schema: SkillsSchema,
			prompt: `Extract distinct skills from the message below. Skills only — no sentences.\n\n${userText}`,
		});
		yield { kind: "step-done", step: 1, data: skillsObj };

		yield { kind: "step-start", step: 2, label: "formatting experience" };
		const { object: jobsObj } = await generateObject({
			model,
			schema: JobsSchema,
			prompt: `Extract the user's work experience. For each job: company, role, years span, 2-3 bullet highlights.\n\n${userText}`,
		});
		yield { kind: "step-done", step: 2, data: jobsObj };

		yield { kind: "step-start", step: 3, label: "assembling CV" };
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
		yield { kind: "step-done", step: 3, data: cv };

		yield { kind: "step-start", step: 4, label: "rendering PDF" };
		const pdf = await renderCVtoPdf(cv);
		yield { kind: "step-done", step: 4, data: pdf };

		yield { kind: "final", cv, pdf };
	} catch (err) {
		yield {
			kind: "error",
			message: err instanceof Error ? err.message : String(err),
		};
	}
}
