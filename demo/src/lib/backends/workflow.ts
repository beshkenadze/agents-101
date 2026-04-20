import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
	type CV,
	CVSchema,
	type DraftCV,
	DraftCVSchema,
} from "@/lib/schemas";

const extractorModel = openai("gpt-5-nano");

export type WorkflowEvent =
	| { kind: "step-start"; step: 1 | 2 | 3; label: string }
	| { kind: "step-done"; step: 1 | 2 | 3 }
	| { kind: "draft-updated"; draft: DraftCV }
	| { kind: "ask-field"; field: string; question: string }
	| { kind: "ready"; cv: CV }
	| { kind: "error"; message: string };

export async function* runWorkflow(
	userText: string,
	priorDraft: DraftCV,
): AsyncGenerator<WorkflowEvent, DraftCV, void> {
	try {
		// step 01 — extract fresh facts from the new message
		yield { kind: "step-start", step: 1, label: "extract fields from message" };
		const { object: extracted } = await generateObject({
			model: extractorModel,
			schema: DraftCVSchema,
			prompt: [
				"Extract CV fields from the message below.",
				"Omit any field you cannot infer. Never invent names, companies, or dates.",
				"",
				"Message:",
				userText,
			].join("\n"),
		});
		yield { kind: "step-done", step: 1 };

		// step 02 — merge with prior draft
		yield { kind: "step-start", step: 2, label: "merge into draft" };
		const merged = mergeDraft(priorDraft, extracted);
		yield { kind: "step-done", step: 2 };
		yield { kind: "draft-updated", draft: merged };

		// step 03 — validate against CVSchema
		yield { kind: "step-start", step: 3, label: "validate draft" };
		const result = CVSchema.safeParse(merged);
		yield { kind: "step-done", step: 3 };

		if (result.success) {
			yield { kind: "ready", cv: result.data };
		} else {
			const issue = result.error.issues[0];
			const path = issue.path.join(".") || "unknown";
			yield { kind: "ask-field", field: path, question: questionFor(path) };
		}

		return merged;
	} catch (err) {
		yield {
			kind: "error",
			message: err instanceof Error ? err.message : String(err),
		};
		return priorDraft;
	}
}

export function mergeDraft(prior: DraftCV, next: DraftCV): DraftCV {
	return {
		name: next.name ?? prior.name,
		headline: next.headline ?? prior.headline,
		skills: mergeSkills(prior.skills, next.skills),
		jobs: mergeJobs(prior.jobs ?? [], next.jobs ?? []),
	};
}

function mergeSkills(a?: string[], b?: string[]) {
	if (!a && !b) return undefined;
	const set = new Set<string>([...(a ?? []), ...(b ?? [])]);
	return Array.from(set);
}

function mergeJobs(prior: NonNullable<DraftCV["jobs"]>, next: NonNullable<DraftCV["jobs"]>) {
	if (next.length === 0) return prior;
	if (prior.length === 0) return next;

	// Heuristic merge: match by role (case-insensitive), otherwise append.
	const byRole = new Map<string, (typeof prior)[number]>();
	for (const j of prior) {
		if (j.role) byRole.set(j.role.toLowerCase(), j);
	}
	const result = [...prior];
	for (const nj of next) {
		const key = nj.role?.toLowerCase() ?? "";
		const existing = key ? byRole.get(key) : undefined;
		if (existing) {
			Object.assign(existing, {
				company: nj.company ?? existing.company,
				role: nj.role ?? existing.role,
				years: nj.years ?? existing.years,
				highlights:
					nj.highlights && nj.highlights.length > 0
						? nj.highlights
						: existing.highlights,
			});
		} else {
			result.push(nj);
		}
	}
	return result;
}

function questionFor(path: string): string {
	if (path === "name") return "What's your full name?";
	if (path === "headline")
		return "Give me a one-line professional headline for yourself.";
	if (path === "skills") return "List a few of your key skills.";
	if (path.startsWith("jobs")) {
		if (path.endsWith("company")) return "Which company was that role at?";
		if (path.endsWith("role")) return "What was your job title there?";
		if (path.endsWith("years"))
			return "What years did you work there? (e.g. 2020–2023)";
		return "Tell me one more detail about a job (company, role, or years).";
	}
	return `Please provide: ${path}`;
}
