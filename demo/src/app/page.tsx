"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";

type Backend = "workflow" | "agent";

export default function ChatPage() {
	const [backend, setBackend] = useState<Backend>("workflow");
	const backendRef = useRef(backend);
	backendRef.current = backend;

	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			prepareSendMessagesRequest: ({ messages: msgs }) => ({
				body: { messages: msgs, backend: backendRef.current },
			}),
		}),
	});

	const handleSubmit = (message: PromptInputMessage) => {
		if (!message.text?.trim()) return;
		sendMessage({ text: message.text });
	};

	return (
		<div className="flex h-screen flex-col mx-auto w-full max-w-3xl px-4 py-6 gap-4">
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold tracking-tight">CV generator</h1>
				<div className="flex gap-1 rounded-md border p-0.5 text-sm">
					{(["workflow", "agent"] as const).map((b) => (
						<Button
							key={b}
							size="sm"
							variant={backend === b ? "default" : "ghost"}
							onClick={() => setBackend(b)}
						>
							{b}
						</Button>
					))}
				</div>
			</header>

			<Conversation className="flex-1 rounded-lg border">
				<ConversationContent>
					{messages.length === 0 ? (
						<ConversationEmptyState
							title="Describe yourself"
							description="Free-form text. The backend shapes it into a CV."
						/>
					) : (
						messages.map((m) => (
							<Message key={m.id} from={m.role}>
								<MessageContent>
									{m.parts.map((p, i) =>
										p.type === "text" ? (
											<MessageResponse key={`${m.id}-${i}`}>
												{p.text}
											</MessageResponse>
										) : null,
									)}
								</MessageContent>
							</Message>
						))
					)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			<PromptInput onSubmit={handleSubmit}>
				<PromptInputBody>
					<PromptInputTextarea placeholder="Type about your work experience…" />
				</PromptInputBody>
				<div className="flex justify-end p-2">
					<PromptInputSubmit status={status} />
				</div>
			</PromptInput>
		</div>
	);
}
