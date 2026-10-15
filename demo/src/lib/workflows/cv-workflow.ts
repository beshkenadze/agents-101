import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { mergeDraft } from "@/lib/backends/merge-draft";
import { extractDraft } from "@/lib/extract";
import { CVSchema, type DraftCV, DraftCVSchema } from "@/lib/schemas";

const inputSchema = z.object({
	userText: z.string(),
	draft: DraftCVSchema,
});

const afterValidateSchema = z.object({
	merged: DraftCVSchema,
	valid: z.boolean(),
	issue: z.string().nullable(),
});

const resultSchema = z.object({
	merged: DraftCVSchema,
	valid: z.boolean(),
	issue: z.string().nullable(),
	question: z.string().nullable(),
});

export type CVWorkflowResult = z.infer<typeof resultSchema>;

// ─── Steps ───────────────────────────────────────────────────

const extractStep = createStep({
	id: "extract",
	inputSchema,
	outputSchema: inputSchema.extend({ extracted: DraftCVSchema }),
	execute: async ({ inputData }) => ({
		...inputData,
		extracted: await extractDraft(inputData.userText),
	}),
});

const mergeStep = createStep({
	id: "merge",
	inputSchema: inputSchema.extend({ extracted: DraftCVSchema }),
	outputSchema: z.object({ merged: DraftCVSchema }),
	execute: async ({ inputData }) => ({
		merged: mergeDraft(inputData.draft, inputData.extracted),
	}),
});

const validateStep = createStep({
	id: "validate",
	inputSchema: z.object({ merged: DraftCVSchema }),
	outputSchema: afterValidateSchema,
	execute: async ({ inputData }) => {
		const parsed = CVSchema.safeParse(inputData.merged);
		if (parsed.success) {
			return { merged: inputData.merged, valid: true, issue: null };
		}
		const first = parsed.error.issues[0];
		return {
			merged: inputData.merged,
			valid: false,
			issue: first.path.join(".") || "unknown",
		};
	},
});

const askStep = createStep({
	id: "ask-field",
	inputSchema: afterValidateSchema,
	outputSchema: resultSchema,
	execute: async ({ inputData }) => ({
		merged: inputData.merged,
		valid: false,
		issue: inputData.issue,
		question: questionFor(inputData.issue ?? "", inputData.merged),
	}),
});

const readyStep = createStep({
	id: "ready",
	inputSchema: afterValidateSchema,
	outputSchema: resultSchema,
	execute: async ({ inputData }) => ({
		merged: inputData.merged,
		valid: true,
		issue: null,
		question: null,
	}),
});

// ─── Workflow ─────────────────────────────────────────────────
// The developer fixes the order: extract → merge → validate → ask | ready.
// Missing data is handled by human-in-the-loop: the workflow asks one
// pre-written question per turn and stops.

export const cvWorkflow = createWorkflow({
	id: "cv-workflow",
	inputSchema,
	outputSchema: resultSchema,
})
	.then(extractStep)
	.then(mergeStep)
	.then(validateStep)
	.branch([
		[async ({ inputData }) => inputData.valid === false, askStep],
		[async ({ inputData }) => inputData.valid === true, readyStep],
	])
	.commit();

// Pre-written questions — plain code, no model call.
function questionFor(path: string, draft: DraftCV): string {
	if (path === "name") return "What's your full name?";
	if (path === "headline")
		return "Give me a one-line professional headline for yourself.";
	if (path === "skills") return "List a few of your key skills.";
	if (path.startsWith("jobs")) {
		// "jobs.0.company" → name the role, so the question is clear with
		// several jobs.
		const role = draft.jobs?.[Number(path.split(".")[1])]?.role;
		if (path.endsWith("company"))
			return role
				? `Which company did you work for as ${role}?`
				: "Which company was that role at?";
		if (path.endsWith("role")) return "What was your job title there?";
		if (path.endsWith("years"))
			return "What years did you work there? (e.g. 2020–2023)";
		return "Tell me one more detail about a job (company, role, or years).";
	}
	return `Please provide: ${path}`;
}
