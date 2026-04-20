import { handleChatStream } from "@mastra/ai-sdk";
import {
	createUIMessageStream,
	createUIMessageStreamResponse,
	type UIMessage,
} from "ai";
import { runWorkflow } from "@/lib/backends/workflow";
import { mastra } from "@/lib/mastra";

export const maxDuration = 120;

type Body = {
	messages: UIMessage[];
	backend?: "workflow" | "agent";
	threadId?: string;
	resourceId?: string;
};

export async function POST(req: Request) {
	const body: Body = await req.json();
	const { messages, backend = "workflow", threadId, resourceId } = body;

	if (backend === "agent") {
		// With memory, Mastra pulls prior messages from storage by threadId —
		// we only need to send the newest user message.
		const lastUser = messages.filter((m) => m.role === "user").at(-1);
		const params: Record<string, unknown> = {
			messages: lastUser ? [lastUser] : messages,
			maxSteps: 12, // extract + updateWM + validate + (askConfirmation ×N) + generatePdf + reply
		};
		if (threadId && resourceId) {
			params.memory = { thread: threadId, resource: resourceId };
		}

		// Wrap the Mastra stream so any error surfaces in the UI instead of
		// being swallowed into a dead stream.
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

	// workflow path
	const userText =
		messages
			.filter((m) => m.role === "user")
			.at(-1)
			?.parts.flatMap((p) => (p.type === "text" ? [p.text] : []))
			.join("\n") ?? "";

	if (!userText.trim()) {
		return new Response("Empty message", { status: 400 });
	}

	const stream = createUIMessageStream({
		execute: async ({ writer }) => {
			for await (const event of runWorkflow(userText)) {
				if (event.kind === "step-start") {
					writer.write({
						type: "data-workflow-step",
						id: `step-${event.step}`,
						data: { step: event.step, label: event.label, status: "running" },
					});
				} else if (event.kind === "step-done") {
					writer.write({
						type: "data-workflow-step",
						id: `step-${event.step}`,
						data: { step: event.step, label: "", status: "done" },
					});
				} else if (event.kind === "final") {
					const textId = crypto.randomUUID();
					writer.write({ type: "text-start", id: textId });
					writer.write({
						type: "text-delta",
						id: textId,
						delta: `**${event.cv.name}** — ${event.cv.headline}`,
					});
					writer.write({ type: "text-end", id: textId });

					writer.write({
						type: "file",
						url: event.pdf.url,
						mediaType: "application/pdf",
					});

					writer.write({
						type: "data-cv",
						id: "cv",
						data: event.cv,
					});
				} else if (event.kind === "error") {
					const textId = crypto.randomUUID();
					writer.write({ type: "text-start", id: textId });
					writer.write({
						type: "text-delta",
						id: textId,
						delta: `**error:** ${event.message}`,
					});
					writer.write({ type: "text-end", id: textId });
				}
			}
		},
		onError: (err) => {
			console.error("[chat route] stream error", err);
			return err instanceof Error ? err.message : "stream error";
		},
	});

	return createUIMessageStreamResponse({ stream });
}
