import { handleChatStream } from "@mastra/ai-sdk";
import {
	createUIMessageStream,
	createUIMessageStreamResponse,
	type UIMessage,
} from "ai";
import {
	clearWorkflowState,
	getWorkflowState,
	setWorkflowState,
} from "@/lib/backends/workflow-state";
import { mastra } from "@/lib/mastra";
import { renderCVtoPdf } from "@/lib/pdf";
import { CVSchema, type UISpec } from "@/lib/schemas";
import { cvWorkflow } from "@/lib/workflows/cv-workflow";

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

				const emitUI = (spec: UISpec) =>
					writer.write({
						type: "data-ui",
						id: `ui-${spec.type}-${crypto.randomUUID().slice(0, 6)}`,
						data: spec,
					});

				// Fast-path: user confirmed PDF and we already have a valid CV.
				if (priorValid && isApproval) {
					const cv = CVSchema.parse(state.draft);
					emitUI({ type: "CVCard", props: cv });

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

				// Run one turn of the Mastra workflow: extract → merge → validate
				// → branch(ask|ready). Map each step id to a numbered UI block.
				const STEP_MAP: Record<string, { step: number; label: string }> = {
					extract: { step: 1, label: "extract fields from message" },
					merge: { step: 2, label: "merge into draft" },
					validate: { step: 3, label: "validate draft" },
					"ask-field": { step: 4, label: "pick next question" },
					ready: { step: 4, label: "ready for PDF" },
				};

				let finalDraft = state.draft;
				let finalResult: {
					merged: typeof state.draft;
					valid: boolean;
					issue: string | null;
					question: string | null;
				} | null = null;

				const run = await cvWorkflow.createRun();
				const wfStream = await run.stream({
					inputData: { userText, draft: state.draft },
				});

				for await (const chunk of wfStream) {
					const payload = (chunk as { payload?: unknown }).payload as
						| { stepId?: string; result?: unknown }
						| undefined;
					const stepId = payload?.stepId;

					if (chunk.type === "workflow-step-start" && stepId) {
						const meta = STEP_MAP[stepId];
						if (meta) {
							writer.write({
								type: "data-workflow-step",
								id: `step-${stepId}`,
								data: {
									step: meta.step,
									label: meta.label,
									status: "running",
								},
							});
						}
					} else if (
						(chunk.type === "workflow-step-result" ||
							chunk.type === "workflow-step-finish") &&
						stepId
					) {
						const meta = STEP_MAP[stepId];
						if (meta) {
							writer.write({
								type: "data-workflow-step",
								id: `step-${stepId}`,
								data: { step: meta.step, label: "", status: "done" },
							});
						}
						// Capture intermediate draft after merge for early preview.
						if (stepId === "merge") {
							const merged = (
								payload?.result as { merged?: typeof state.draft }
							)?.merged;
							if (merged) {
								finalDraft = merged;
								// Render preview only when the draft validates — emitUI
								// uses the same CVSchema the agent side uses.
								const parsed = CVSchema.safeParse(merged);
								if (parsed.success) {
									emitUI({ type: "CVCard", props: parsed.data });
								}
							}
						}
						// Either ask-field or ready is the final branch step.
						if (stepId === "ask-field" || stepId === "ready") {
							finalResult = payload?.result as typeof finalResult;
						}
					}
				}

				// Fallback: if we didn't capture the final result from step events,
				// read it from the finished stream.
				if (!finalResult) {
					const done = await wfStream.result;
					const raw = (done as { result?: unknown }).result as
						| Record<string, typeof finalResult>
						| undefined;
					finalResult =
						raw?.["ask-field"] ?? raw?.ready ?? (raw as typeof finalResult);
				}

				if (finalResult) {
					finalDraft = finalResult.merged;
					if (finalResult.valid) {
						emitUI({
							type: "ConfirmCard",
							props: {
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
					} else if (finalResult.question) {
						const id = crypto.randomUUID();
						writer.write({ type: "text-start", id });
						writer.write({
							type: "text-delta",
							id,
							delta: finalResult.question,
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
