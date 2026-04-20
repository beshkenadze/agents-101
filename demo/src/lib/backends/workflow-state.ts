import type { DraftCV } from "@/lib/schemas";

// In-memory per-thread workflow draft. Fine for the demo (single-process).
// For production, swap to Mastra storage or the LibSQL store directly.
const store = new Map<string, { draft: DraftCV }>();

// DraftCVSchema is nullable-strict (every field required, may be null) so the
// initial blank draft must supply explicit nulls, not omissions.
const emptyDraft = (): DraftCV => ({
	name: null,
	headline: null,
	skills: null,
	jobs: null,
});

export function getWorkflowState(threadId: string) {
	return store.get(threadId) ?? { draft: emptyDraft() };
}

export function setWorkflowState(threadId: string, draft: DraftCV) {
	store.set(threadId, { draft });
}

export function clearWorkflowState(threadId: string) {
	store.delete(threadId);
}
