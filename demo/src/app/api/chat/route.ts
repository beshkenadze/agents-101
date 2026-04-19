import {
	createUIMessageStream,
	createUIMessageStreamResponse,
	type UIMessage,
} from "ai";
import { runWorkflow } from "@/lib/backends/workflow";

export const maxDuration = 60;

type Body = {
	messages: UIMessage[];
	backend?: "workflow" | "agent";
};

export async function POST(req: Request) {
	const { messages, backend = "workflow" }: Body = await req.json();

	const userText = messages
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

			if (backend === "workflow") {
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
			} else {
				writer.write({
					type: "text-delta",
					id,
					delta: "**backend: agent** — not wired yet. Phase 2.",
				});
			}

			writer.write({ type: "text-end", id });
		},
	});

	return createUIMessageStreamResponse({ stream });
}
