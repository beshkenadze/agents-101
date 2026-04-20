import type { DraftCV } from "@/lib/schemas";

// In-memory per-thread workflow draft. Fine for the demo (single-process).
// For production, swap to Mastra storage or the LibSQL store directly.
const store = new Map<string, { draft: DraftCV }>();

export function getWorkflowState(threadId: string) {
	return store.get(threadId) ?? { draft: {} as DraftCV };
}

export function setWorkflowState(threadId: string, draft: DraftCV) {
	store.set(threadId, { draft });
}

export function clearWorkflowState(threadId: string) {
	store.delete(threadId);
}
