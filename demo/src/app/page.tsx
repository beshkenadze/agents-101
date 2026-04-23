"use client";

import { useChat } from "@ai-sdk/react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import { DefaultChatTransport, type ToolUIPart } from "ai";
import { type ReactNode, useRef, useState } from "react";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	PromptInput,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
	Suggestion,
	Suggestions,
} from "@/components/ai-elements/suggestion";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/ai-elements/tool";
import { type UISpec, UISpecSchema } from "@/lib/schemas";
import { registry } from "@/lib/ui/registry";
import { ReplyContext } from "@/lib/ui/reply-context";

type Backend = "workflow" | "agent";

type WorkflowStep = {
	step: 1 | 2 | 3 | 4;
	label: string;
	status: "running" | "done";
};

const STEP_LABELS: Record<number, string> = {
	1: "extractSkills()",
	2: "formatExperience()",
	3: "assembleCV()",
	4: "generatePdf()",
};

const SUGGESTIONS = [
	"3 years React, last year lead at a startup",
	"TypeScript + Node, some Python",
	"Agency work before, now product",
];

function filePartName(url: string) {
	return url.split("/").pop() ?? "download.pdf";
}

function formatBytes(n: number) {
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ChatPage() {
	const [backend, setBackend] = useState<Backend>("agent");
	const backendRef = useRef(backend);
	backendRef.current = backend;

	// One thread per page session; resource is a stable demo-user id.
	// With Mastra memory the server holds history, so we only send the new
	// message each turn (and OpenAI reasoning items stay server-side too).
	const [threadId] = useState(
		() =>
			(typeof crypto !== "undefined" && crypto.randomUUID()) ||
			String(Date.now()),
	);
	const resourceId = "demo-user";

	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			prepareSendMessagesRequest: ({ messages: msgs }) => ({
				body: {
					messages: msgs,
					backend: backendRef.current,
					threadId,
					resourceId,
				},
			}),
		}),
	});

	const [input, setInput] = useState("");

	const handleSubmit = (message: PromptInputMessage) => {
		const text = message.text?.trim();
		if (!text || status === "streaming" || status === "submitted") return;
		sendMessage({ text });
		setInput("");
	};

	const handleSuggestion = (text: string) => {
		sendMessage({ text });
		setInput("");
	};

	const busy = status === "streaming" || status === "submitted";
	const showSuggestions = messages.length === 0;

	return (
		<ReplyContext.Provider
			value={{ onReply: (text) => sendMessage({ text }), disabled: busy }}
		>
			<JSONUIProvider registry={registry}>
				<div className="app">
					<div className="brand">
						<div className="name">
							agents-101<span className="caret">▊</span>
						</div>
						<div className="meta">
							<span className="status-dot" />
							session · live demo
						</div>
					</div>

					<div className="window">
						<div className="tbar">
							<span className="dots-mini">
								<i />
								<i />
								<i />
							</span>
							<span className="path">
								<span className="tilde">~</span>/demo/cv-generator — chat
							</span>
							<span className="spacer" />
							<button
								type="button"
								className="mode-badge"
								data-mode={backend}
								title="click to toggle backend"
								onClick={() =>
									setBackend((b) => (b === "agent" ? "workflow" : "agent"))
								}
							>
								<span className="pill" />
								<span>mode: {backend}</span>
							</button>
						</div>

						<Conversation>
							<ConversationContent className="flex flex-col gap-5 px-7 py-6">
								<SystemLine role="// init">
									session started · model: gpt-5-mini · tools: extractSkills,
									formatExperience, generatePdf, webSearch
								</SystemLine>
								<AssistantLine>
									Hey. Tell me about your work — skills, jobs, years — in plain
									words. I'll turn it into a structured CV and export it to PDF.
								</AssistantLine>

								{messages.map((m, mi) => (
									<MessageView
										key={m.id}
										message={m}
										isLast={mi === messages.length - 1}
										busy={busy}
										backend={backend}
									/>
								))}

								{busy && messages.at(-1)?.role !== "assistant" && (
									<div className="msg assistant">
										<span className="role">agent</span>
										<span className="content">
											<Shimmer>thinking…</Shimmer>
										</span>
									</div>
								)}
							</ConversationContent>
							<ConversationScrollButton />
						</Conversation>

						{showSuggestions && (
							<div className="suggestions">
								{SUGGESTIONS.map((s) => (
									<Suggestion
										key={s}
										suggestion={s}
										onClick={handleSuggestion}
										className="chip"
									/>
								))}
							</div>
						)}

						<PromptInput onSubmit={handleSubmit} className="inputbar">
							<PromptInputTextarea
								placeholder="type a message, enter to send · shift+enter for newline"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								disabled={busy}
							/>
							<PromptInputSubmit
								status={status}
								disabled={busy || !input.trim()}
							/>
						</PromptInput>
					</div>

					<div className="hints">
						<span>
							<span className="kbd">↵</span> send ·{" "}
							<span className="kbd">⇧↵</span> newline ·{" "}
							<span className="kbd">⌘K</span> clear
						</span>
						<span>agents 101 · demo</span>
					</div>
				</div>
			</JSONUIProvider>
		</ReplyContext.Provider>
	);
}

/* ─── sub-components ─────────────────────────────────────── */

function SystemLine({
	children,
	role = "// sys",
}: {
	children: React.ReactNode;
	role?: string;
}) {
	return (
		<div className="msg system">
			<span className="role">{role}</span>
			<span className="content">{children}</span>
		</div>
	);
}

function AssistantLine({ children }: { children: React.ReactNode }) {
	return (
		<div className="msg assistant">
			<span className="role">agent</span>
			<span className="content">{children}</span>
		</div>
	);
}

function UserLine({ children }: { children: React.ReactNode }) {
	return (
		<div className="msg user">
			<span className="role">user ❯</span>
			<span className="content">{children}</span>
		</div>
	);
}

function Divider({ label }: { label: string }) {
	return (
		<div className="divider">
			<span>{label}</span>
		</div>
	);
}

function ArtifactLink({
	url,
	mediaType,
	bytes,
}: {
	url: string;
	mediaType?: string;
	bytes?: number;
}) {
	return (
		<a
			className="artifact"
			href={url}
			target="_blank"
			rel="noreferrer"
			download
		>
			<span className="badge">PDF</span>
			<span className="name">{filePartName(url)}</span>
			{typeof bytes === "number" && (
				<span className="size">{formatBytes(bytes)}</span>
			)}
			{!bytes && mediaType && <span className="size">{mediaType}</span>}
		</a>
	);
}

/* ─── message rendering ──────────────────────────────────── */

type Part = {
	type: string;
	[k: string]: unknown;
};

type UiMessage = {
	id: string;
	role: "user" | "assistant" | "system";
	parts: Part[];
};

function MessageView({
	message,
	isLast,
	busy,
	backend,
}: {
	message: UiMessage;
	isLast: boolean;
	busy: boolean;
	backend: Backend;
}) {
	if (message.role === "user") {
		const text = message.parts
			.filter((p) => p.type === "text")
			.map((p) => (p as unknown as { text: string }).text)
			.join("\n");
		return <UserLine>{text}</UserLine>;
	}

	// collect workflow steps (keep last status per step)
	const stepsMap = new Map<number, WorkflowStep>();
	for (const p of message.parts) {
		if (p.type === "data-workflow-step") {
			const data = (p as unknown as { data: WorkflowStep }).data;
			stepsMap.set(data.step, data);
		}
	}
	const steps = Array.from(stepsMap.values()).sort((a, b) => a.step - b.step);

	const files = message.parts.filter((p) => p.type === "file") as unknown as {
		type: "file";
		url: string;
		mediaType: string;
	}[];

	const textParts = message.parts.filter(
		(p) => p.type === "text",
	) as unknown as {
		type: "text";
		text: string;
	}[];

	// Unified UI pipeline.
	// • Agent tools return `ui: { type, props }` in their output — the agent
	//   picks the component by picking the tool.
	// • Workflow emits `data-ui` events with the same shape.
	// Everything flows through json-render's Renderer via the shared catalog.
	type PdfTool = {
		toolCallId?: string;
		state?: string;
		output?: { url?: string; bytes?: number };
	};
	let pdfTool: PdfTool | null = null;
	type UiEntry = { key: string; spec: UISpec };
	const uiEntries: UiEntry[] = [];

	const pushSpec = (key: string, raw: unknown) => {
		const parsed = UISpecSchema.safeParse(raw);
		if (parsed.success) uiEntries.push({ key, spec: parsed.data });
	};

	for (const p of message.parts) {
		// Workflow: data-ui event carries a UISpec directly.
		if (p.type === "data-ui") {
			pushSpec(
				`data-ui-${(p as { id?: string }).id ?? ""}`,
				(p as { data?: unknown }).data,
			);
			continue;
		}
		// Agent: any tool-* with output.ui contributes its spec.
		if (typeof p.type === "string" && p.type.startsWith("tool-")) {
			const tp = p as {
				type: string;
				toolCallId?: string;
				state?: string;
				output?: unknown;
			};
			if (
				tp.state === "output-available" &&
				tp.output &&
				typeof tp.output === "object" &&
				"ui" in tp.output
			) {
				pushSpec(
					tp.toolCallId ?? `${tp.type}-tool`,
					(tp.output as { ui: unknown }).ui,
				);
			}
			if (p.type === "tool-generatePdf") pdfTool = tp as PdfTool;
		}
	}

	// Dedupe (streams may send the same event multiple times).
	const seen = new Set<string>();
	const uiSpecs = uiEntries.filter((u) => {
		const k = `${u.spec.type}-${u.key}`;
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});

	const pdfUrl =
		pdfTool && pdfTool.state === "output-available" && pdfTool.output
			? pdfTool.output.url
			: undefined;
	const pdfBytes =
		pdfTool && pdfTool.state === "output-available" && pdfTool.output
			? pdfTool.output.bytes
			: undefined;

	// Tool parts stream as multiple events per call (input-streaming, input-available,
	// output-available). Dedupe by toolCallId so one call = one block, keeping the
	// latest state.
	type ToolPart = {
		type: `tool-${string}`;
		toolCallId?: string;
		state?: string;
		input?: unknown;
		output?: unknown;
	};
	// Tool blocks: skip tools whose output is rendered as a dedicated UI
	// (askConfirmation → ConfirmCard, generatePdf → Attachment, validateCV →
	// folded into CVCard render). Everything else shows as a generic block.
	const rawToolParts = message.parts.filter(
		(p) =>
			typeof p.type === "string" &&
			p.type.startsWith("tool-") &&
			p.type !== "tool-generatePdf" &&
			p.type !== "tool-askConfirmation" &&
			p.type !== "tool-validateCV",
	) as unknown as ToolPart[];
	const toolById = new Map<string, ToolPart>();
	rawToolParts.forEach((p, idx) => {
		const key = p.toolCallId ?? `${p.type}-${idx}`;
		toolById.set(key, p);
	});
	const toolParts = Array.from(toolById.values());

	const lastAssistantText = textParts.map((p) => p.text).join("");

	return (
		<>
			{backend === "workflow" && steps.length > 0 && (
				<Divider
					label={`workflow · step ${Math.max(...steps.map((s) => s.step))}/4`}
				/>
			)}
			{backend === "agent" && toolParts.length > 0 && (
				<Divider label="agent loop · tools enabled" />
			)}

			{steps.map((s) => (
				<Tool key={`step-${s.step}`} defaultOpen={false}>
					<ToolHeader
						type="dynamic-tool"
						toolName={`step ${s.step} · ${STEP_LABELS[s.step] ?? s.label}`}
						state={s.status === "done" ? "output-available" : "input-available"}
					/>
				</Tool>
			))}

			{toolParts.map((p, i) => {
				const state = (p.state ?? "input-streaming") as ToolUIPart["state"];
				return (
					<Tool
						key={p.toolCallId ?? `${message.id}-tool-${i}`}
						defaultOpen={false}
					>
						<ToolHeader type={p.type as ToolUIPart["type"]} state={state} />
						<ToolContent>
							{p.input !== undefined && (
								<ToolInput input={p.input as ToolUIPart["input"]} />
							)}
							<ToolOutput
								output={p.output as ReactNode}
								errorText={undefined as unknown as ToolUIPart["errorText"]}
							/>
						</ToolContent>
					</Tool>
				);
			})}

			{lastAssistantText && <AssistantLine>{lastAssistantText}</AssistantLine>}

			{uiSpecs.map((u) => {
				// Hide stale Yes/No cards on older turns; CV previews stay.
				if (u.spec.type === "ConfirmCard" && !isLast) return null;
				const role =
					u.spec.type === "CVCard"
						? "cv"
						: u.spec.type === "ConfirmCard"
							? "ask"
							: "ui";
				return (
					<div className="msg assistant" key={`ui-${u.spec.type}-${u.key}`}>
						<span className="role">{role}</span>
						<span className="content" style={{ border: "none", padding: 0 }}>
							<Renderer
								spec={{
									root: "r",
									elements: {
										r: {
											type: u.spec.type,
											props: u.spec.props as unknown as Record<string, unknown>,
											children: [],
										},
									},
								}}
								registry={registry}
							/>
						</span>
					</div>
				);
			})}

			{pdfUrl && (
				<div className="msg assistant">
					<span className="role">artifact</span>
					<span className="content" style={{ border: "none", padding: 0 }}>
						<ArtifactLink
							url={pdfUrl}
							mediaType="application/pdf"
							bytes={pdfBytes}
						/>
					</span>
				</div>
			)}

			{files.length > 0 && (
				<div className="msg assistant">
					<span className="role">artifact</span>
					<span className="content" style={{ border: "none", padding: 0 }}>
						{files.map((f, i) => (
							<ArtifactLink
								key={`${message.id}-file-${i}`}
								url={f.url}
								mediaType={f.mediaType}
							/>
						))}
					</span>
				</div>
			)}

			{isLast && busy && !lastAssistantText && (
				<div className="msg assistant">
					<span className="role">agent</span>
					<span className="content">
						<Shimmer>thinking…</Shimmer>
					</span>
				</div>
			)}
		</>
	);
}
