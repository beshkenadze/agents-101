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
import { type CVWorkflowResult, cvWorkflow } from "@/lib/workflows/cv-workflow";

export const maxDuration = 120;

type Body = {
	messages: UIMessage[];
	backend?: "workflow" | "agent";
	threadId?: string;
	resourceId?: string;
};

const APPROVAL_RE =
	/^\s*(yes|yep|yeah|approve|approved|generate|ok|go|do it|let'?s go)\b/i;

type Writer = Parameters<
	Parameters<typeof createUIMessageStream>[0]["execute"]
>[0]["writer"];

// One short, readable line for the chat. The page shows it with a retry
// button, so a network or API hiccup on stage is one click to fix.
function errorText(err: unknown) {
	const raw = err instanceof Error ? err.message : String(err);
	const line = raw.split("\n")[0].trim();
	return line.length > 180 ? `${line.slice(0, 177)}…` : line;
}

function writeError(writer: Writer, message: string) {
	writer.write({
		type: "data-error",
		id: `error-${crypto.randomUUID().slice(0, 6)}`,
		data: { message },
	});
}

export async function POST(req: Request) {
	const body: Body = await req.json();
	const { messages, backend = "workflow", threadId, resourceId } = body;

	if (backend === "agent") {
		const lastUser = messages.filter((m) => m.role === "user").at(-1);
		// Only the latest user turn is sent: Mastra memory already holds the
		// thread history and the working-memory draft.
		const params = {
			messages: lastUser ? [lastUser] : messages,
			maxSteps: 12,
			...(threadId && resourceId
				? { memory: { thread: threadId, resource: resourceId } }
				: {}),
		};

		const stream = createUIMessageStream({
			execute: async ({ writer }) => {
				try {
					const agentStream = await handleChatStream({
						mastra,
						agentId: "cvAgent",
						params,
						version: "v7",
					});
					writer.merge(agentStream);
				} catch (err) {
					console.error("[chat route] agent stream failed", err);
					writeError(writer, `agent failed: ${errorText(err)}`);
				}
			},
			onError: (err) => {
				console.error("[chat route] stream error (agent)", err);
				return `agent failed: ${errorText(err)}`;
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
			// The step that is running now. If anything throws, this step is
			// marked as failed, so the UI never shows a stuck spinner.
			type StepRef = { id: string; step: number; label: string };
			let running: StepRef | null = null;
			let failedLabel: string | null = null;
			const writeStep = (
				id: string,
				meta: { step: number; label: string },
				status: "running" | "done" | "error",
			) => {
				writer.write({
					type: "data-workflow-step",
					id: `step-${id}`,
					data: { step: meta.step, label: meta.label, status },
				});
				running = status === "running" ? { id, ...meta } : null;
				if (status === "error") failedLabel = meta.label;
			};

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

					const pdfStep = { step: 4, label: "renderPdf() · plain code" };
					writeStep("pdf", pdfStep, "running");
					const pdf = await renderCVtoPdf(cv);
					writeStep("pdf", pdfStep, "done");

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
					extract: { step: 1, label: "extract() · LLM call" },
					merge: { step: 2, label: "merge() · plain code" },
					validate: { step: 3, label: "validate() · Zod" },
					"ask-field": { step: 4, label: "branch → ask for missing field" },
					ready: { step: 4, label: "branch → ready for PDF" },
				};

				let finalDraft = state.draft;
				let finalResult: CVWorkflowResult | null = null;

				const run = await cvWorkflow.createRun();
				const wfStream = await run.stream({
					inputData: { userText, draft: state.draft },
				});

				for await (const chunk of wfStream.fullStream) {
					// Mastra 1.x step events: payload.id is the step id and
					// payload.output its result (older versions: stepId / result).
					const payload = (chunk as { payload?: unknown }).payload as
						| {
								id?: string;
								stepId?: string;
								status?: string;
								output?: unknown;
								result?: unknown;
						  }
						| undefined;
					const stepId = payload?.id ?? payload?.stepId;
					const stepOutput = payload?.output ?? payload?.result;

					if (chunk.type === "workflow-step-start" && stepId) {
						const meta = STEP_MAP[stepId];
						if (meta) writeStep(stepId, meta, "running");
					} else if (
						(chunk.type === "workflow-step-result" ||
							chunk.type === "workflow-step-finish") &&
						stepId
					) {
						const meta = STEP_MAP[stepId];
						const failed = payload?.status === "failed";
						if (meta) writeStep(stepId, meta, failed ? "error" : "done");
						if (failed) continue;
						// Capture intermediate draft after merge for early preview.
						if (stepId === "merge") {
							const merged = (stepOutput as { merged?: typeof state.draft })
								?.merged;
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
						if ((stepId === "ask-field" || stepId === "ready") && stepOutput) {
							finalResult = stepOutput as CVWorkflowResult;
						}
					}
				}

				// Fallback: if we didn't capture the final result from step events,
				// read it from the finished stream. A failed run throws here, and
				// the catch below shows the error.
				if (!finalResult) {
					const done = await wfStream.result;
					if (done.status === "failed") {
						throw done.error ?? new Error("workflow run failed");
					}
					const raw = (done as { result?: unknown }).result as
						| (CVWorkflowResult & Record<string, CVWorkflowResult | undefined>)
						| undefined;
					finalResult = raw?.["ask-field"] ?? raw?.ready ?? raw ?? null;
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
				const stuck = running as StepRef | null;
				if (stuck) writeStep(stuck.id, stuck, "error");
				writeError(
					writer,
					`${failedLabel ?? "workflow"} failed: ${errorText(err)}`,
				);
			}
		},
		onError: (err) => {
			console.error("[chat route] stream error (workflow)", err);
			return `workflow failed: ${errorText(err)}`;
		},
	});

	return createUIMessageStreamResponse({ stream });
}
