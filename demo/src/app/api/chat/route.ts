import { handleChatStream } from "@mastra/ai-sdk";
import {
	createUIMessageStream,
	createUIMessageStreamResponse,
	type UIMessage,
} from "ai";
import { runWorkflow } from "@/lib/backends/workflow";
import { mastra } from "@/lib/mastra";

export const maxDuration = 60;

type Body = {
	messages: UIMessage[];
	backend?: "workflow" | "agent";
};

export async function POST(req: Request) {
	const body: Body = await req.json();
	const { messages, backend = "workflow" } = body;

	if (backend === "agent") {
		const stream = await handleChatStream({
			mastra,
			agentId: "cvAgent",
			params: { messages },
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
			const id = crypto.randomUUID();
			writer.write({ type: "text-start", id });
			writer.write({
				type: "text-delta",
				id,
				delta: "**backend: workflow** — three generateObject calls…\n\n",
			});
			const cv = await runWorkflow(userText);
			writer.write({
				type: "text-delta",
				id,
				delta: `\`\`\`json\n${JSON.stringify(cv, null, 2)}\n\`\`\``,
			});
			writer.write({ type: "text-end", id });
		},
	});

	return createUIMessageStreamResponse({ stream });
}
