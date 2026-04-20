import { handleChatStream } from "@mastra/ai-sdk";
import {
	createUIMessageStream,
	createUIMessageStreamResponse,
	type UIMessage,
} from "ai";
import { renderCVtoPdf } from "@/lib/pdf";
import {
	clearWorkflowState,
	getWorkflowState,
	setWorkflowState,
} from "@/lib/backends/workflow-state";
import { runWorkflow } from "@/lib/backends/workflow";
import { mastra } from "@/lib/mastra";
import { CVSchema } from "@/lib/schemas";

export const maxDuration = 120;

type Body = {
	messages: UIMessage[];
	backend?: "workflow" | "agent";
	threadId?: string;
	resourceId?: string;
};

const APPROVAL_RE =
	/^\s*(yes|yep|yeah|approve|approved|generate|ok|go|do it|let'?s go)\b/i;

export async function POST(req: Request) {
	const body: Body = await req.json();
	const { messages, backend = "workflow", threadId, resourceId } = body;

	if (backend === "agent") {
		const lastUser = messages.filter((m) => m.role === "user").at(-1);
		const params: Record<string, unknown> = {
			messages: lastUser ? [lastUser] : messages,
			maxSteps: 12,
		};
		if (threadId && resourceId) {
			params.memory = { thread: threadId, resource: resourceId };
		}

		const stream = createUIMessageStream({
			execute: async ({ writer }) => {
				try {
					const agentStream = await handleChatStream({
						mastra,
						agentId: "cvAgent",
						params,
					});
					writer.merge(agentStream);
				} catch (err) {
					console.error("[chat route] agent stream failed", err);
					const id = crypto.randomUUID();
					writer.write({ type: "text-start", id });
					writer.write({
						type: "text-delta",
						id,
						delta: `**agent error:** ${
							err instanceof Error ? err.message : String(err)
						}`,
					});
					writer.write({ type: "text-end", id });
				}
			},
			onError: (err) => {
				console.error("[chat route] stream error (agent)", err);
				return err instanceof Error ? err.message : "stream error";
			},
		});

		return createUIMessageStreamResponse({ stream });
	}

	// ─── workflow backend (interactive) ─────────────────────────
	const userText =
		messages
			.filter((m) => m.role === "user")
			.at(-1)
			?.parts.flatMap((p) => (p.type === "text" ? [p.text] : []))
			.join("\n") ?? "";

	if (!userText.trim()) {
		return new Response("Empty message", { status: 400 });
	}

	const tid = threadId ?? "workflow-default";

	const stream = createUIMessageStream({
		execute: async ({ writer }) => {
			try {
				const state = getWorkflowState(tid);
				const priorValid = CVSchema.safeParse(state.draft).success;
				const isApproval = APPROVAL_RE.test(userText);

				// Fast-path: user confirmed PDF and we already have a valid CV.
				if (priorValid && isApproval) {
					const cv = CVSchema.parse(state.draft);
					writer.write({ type: "data-cv", id: "cv", data: cv });

					writer.write({
						type: "data-workflow-step",
						id: "step-pdf",
						data: { step: 4, label: "render PDF", status: "running" },
					});
					const pdf = await renderCVtoPdf(cv);
					writer.write({
						type: "data-workflow-step",
						id: "step-pdf",
						data: { step: 4, label: "render PDF", status: "done" },
					});

					writer.write({
						type: "file",
						url: pdf.url,
						mediaType: "application/pdf",
					});
					const tid2 = crypto.randomUUID();
					writer.write({ type: "text-start", id: tid2 });
					writer.write({
						type: "text-delta",
						id: tid2,
						delta: "Done — PDF below.",
					});
					writer.write({ type: "text-end", id: tid2 });

					clearWorkflowState(tid);
					return;
				}

				// Run one turn of the workflow: extract → merge → validate → decide.
				let finalDraft = state.draft;
				for await (const event of runWorkflow(userText, state.draft)) {
					if (event.kind === "step-start") {
						writer.write({
							type: "data-workflow-step",
							id: `step-${event.step}`,
							data: {
								step: event.step,
								label: event.label,
								status: "running",
							},
						});
					} else if (event.kind === "step-done") {
						writer.write({
							type: "data-workflow-step",
							id: `step-${event.step}`,
							data: { step: event.step, label: "", status: "done" },
						});
					} else if (event.kind === "draft-updated") {
						finalDraft = event.draft;
						writer.write({
							type: "data-cv",
							id: "cv",
							data: event.draft,
						});
					} else if (event.kind === "ask-field") {
						const id = crypto.randomUUID();
						writer.write({ type: "text-start", id });
						writer.write({
							type: "text-delta",
							id,
							delta: event.question,
						});
						writer.write({ type: "text-end", id });
					} else if (event.kind === "ready") {
						writer.write({
							type: "data-confirm",
							id: "confirm",
							data: {
								field: "generate PDF",
								question: "Generate the PDF from this CV?",
								proposedValue: "Yes, generate",
							},
						});
						const id = crypto.randomUUID();
						writer.write({ type: "text-start", id });
						writer.write({
							type: "text-delta",
							id,
							delta: "CV ready — confirm to generate the PDF.",
						});
						writer.write({ type: "text-end", id });
					} else if (event.kind === "error") {
						const id = crypto.randomUUID();
						writer.write({ type: "text-start", id });
						writer.write({
							type: "text-delta",
							id,
							delta: `**error:** ${event.message}`,
						});
						writer.write({ type: "text-end", id });
					}
				}

				setWorkflowState(tid, finalDraft);
			} catch (err) {
				console.error("[chat route] workflow failed", err);
				const id = crypto.randomUUID();
				writer.write({ type: "text-start", id });
				writer.write({
					type: "text-delta",
					id,
					delta: `**workflow error:** ${
						err instanceof Error ? err.message : String(err)
					}`,
				});
				writer.write({ type: "text-end", id });
			}
		},
		onError: (err) => {
			console.error("[chat route] stream error (workflow)", err);
			return err instanceof Error ? err.message : "stream error";
		},
	});

	return createUIMessageStreamResponse({ stream });
}
