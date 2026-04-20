"use client";

import { useChat } from "@ai-sdk/react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import { DefaultChatTransport } from "ai";
import {
	type FormEvent,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Confirmation,
	ConfirmationAccepted,
	ConfirmationAction,
	ConfirmationActions,
	ConfirmationRejected,
	ConfirmationRequest,
} from "@/components/ai-elements/confirmation";
import { type CV, CVSchema } from "@/lib/schemas";
import { registry } from "@/lib/ui/registry";

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

	const { messages, sendMessage, status, addToolApprovalResponse } = useChat({
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

	const chatRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [input, setInput] = useState("");

	// auto-scroll on new messages
	useEffect(() => {
		const el = chatRef.current;
		if (!el) return;
		requestAnimationFrame(() => {
			el.scrollTop = el.scrollHeight;
		});
	}, [messages]);

	// focus input on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// cmd+K to clear (not implemented fully — useChat has no clear method exposed,
	// but we keep the shortcut advertised in the hints)
	useEffect(() => {
		const onKey = (e: globalThis.KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				location.reload();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const autoGrow = () => {
		const el = inputRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
	};

	const handleSubmit = (e?: FormEvent) => {
		e?.preventDefault();
		const text = input.trim();
		if (!text || status === "streaming" || status === "submitted") return;
		sendMessage({ text });
		setInput("");
		requestAnimationFrame(autoGrow);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleSuggestion = (text: string) => {
		setInput(text);
		requestAnimationFrame(() => {
			autoGrow();
			inputRef.current?.focus();
		});
	};

	const busy = status === "streaming" || status === "submitted";
	const showSuggestions = messages.length === 0;

	return (
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

				<div className="chat" ref={chatRef}>
					<SystemLine role="// init">
						session started · model: gpt-5-mini · tools: extractSkills,
						formatExperience, generatePdf, webSearch
					</SystemLine>
					<AssistantLine>
						Hey. Tell me about your work — skills, jobs, years — in plain words.
						I'll turn it into a structured CV and export it to PDF.
					</AssistantLine>

					{messages.map((m, mi) => (
						<MessageView
							key={m.id}
							message={m}
							isLast={mi === messages.length - 1}
							busy={busy}
							backend={backend}
							onApproval={addToolApprovalResponse}
							onReply={(text) => sendMessage({ text })}
						/>
					))}

					{busy && messages.at(-1)?.role !== "assistant" && (
						<div className="msg assistant">
							<span className="role">agent</span>
							<span className="content">
								<span className="thinking">
									<span className="d" />
									<span className="d" />
									<span className="d" />
								</span>
							</span>
						</div>
					)}
				</div>

				{showSuggestions && (
					<div className="suggestions">
						{SUGGESTIONS.map((s) => (
							<button
								key={s}
								type="button"
								className="chip"
								onClick={() => handleSuggestion(s)}
							>
								{s}
							</button>
						))}
					</div>
				)}

				<form className="inputbar" onSubmit={handleSubmit}>
					<span className="prompt">❯</span>
					<textarea
						ref={inputRef}
						rows={1}
						placeholder="type a message, enter to send · shift+enter for newline"
						autoComplete="off"
						spellCheck={false}
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							autoGrow();
						}}
						onKeyDown={handleKeyDown}
						disabled={busy}
					/>
					<button className="send" type="submit" disabled={busy || !input.trim()}>
						<span>run</span>
						<span className="kbd">↵</span>
					</button>
				</form>
			</div>

			<div className="hints">
				<span>
					<span className="kbd">↵</span> send · <span className="kbd">⇧↵</span>{" "}
					newline · <span className="kbd">⌘K</span> clear
				</span>
				<span>agents 101 · demo</span>
			</div>
		</div>
		</JSONUIProvider>
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

function ToolBlock({
	title,
	args,
	done,
	result,
}: {
	title: string;
	args?: Record<string, unknown> | string;
	done?: boolean;
	result?: string;
}) {
	const entries =
		args && typeof args === "object"
			? Object.entries(args)
			: args
				? [["input", args]]
				: [];
	return (
		<div className="tool" data-done={done ? "" : undefined}>
			<span className="role">tool</span>
			<div className="body">
				<div className="head">
					<span className="spin" />
					<span>{title}</span>
				</div>
				{entries.length > 0 || result ? (
					<div className="args">
						{entries.map(([k, v]) => {
							const raw =
								typeof v === "string" ? v : JSON.stringify(v);
							const preview =
								raw.length > 160 ? `${raw.slice(0, 160)}…` : raw;
							return (
								<div key={k}>
									<span className="k">{k}:</span>{" "}
									<span className="s">
										{typeof v === "string" ? `"${preview}"` : preview}
									</span>
								</div>
							);
						})}
						{done && result ? <div className="done">→ {result}</div> : null}
					</div>
				) : null}
			</div>
		</div>
	);
}

function ConfirmationPrompt({
	state,
	approval,
	onApproval,
	question,
	proposedValue,
	field,
}: {
	state?: string;
	approval: { id: string };
	onApproval: ApprovalResponseFn;
	question: string;
	proposedValue?: string;
	field?: string;
}) {
	return (
		<Confirmation
			approval={approval as never}
			state={state as never}
			className="bg-transparent text-[color:var(--fg)] border-[color:var(--line)]"
		>
			<ConfirmationRequest>
				{field ? (
					<>
						<div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--fg-faint)", marginBottom: 6 }}>
							{field}
						</div>
					</>
				) : null}
				<div>{question}</div>
				{proposedValue ? (
					<div
						style={{
							marginTop: 8,
							padding: "6px 10px",
							border: "1px solid var(--line)",
							borderRadius: 4,
							background: "var(--bg-3)",
							fontFamily: "var(--font-mono)",
							color: "var(--accent)",
							fontSize: 13,
						}}
					>
						{proposedValue}
					</div>
				) : null}
			</ConfirmationRequest>
			<ConfirmationAccepted>approved</ConfirmationAccepted>
			<ConfirmationRejected>rejected</ConfirmationRejected>
			<ConfirmationActions>
				<ConfirmationAction
					variant="outline"
					onClick={() => onApproval({ id: approval.id, approved: false })}
				>
					Reject
				</ConfirmationAction>
				<ConfirmationAction
					variant="default"
					onClick={() => onApproval({ id: approval.id, approved: true })}
				>
					Approve
				</ConfirmationAction>
			</ConfirmationActions>
		</Confirmation>
	);
}

function ConfirmCard({
	field,
	question,
	proposedValue,
	onReply,
	disabled,
}: {
	field?: string;
	question: string;
	proposedValue?: string;
	onReply: (text: string) => void;
	disabled?: boolean;
}) {
	return (
		<div
			style={{
				border: "1px solid var(--accent-dim)",
				background: "var(--bg-3)",
				borderRadius: 6,
				padding: "14px 16px",
				display: "flex",
				flexDirection: "column",
				gap: 12,
				animation: "fadeIn 220ms ease both",
			}}
		>
			{field ? (
				<div
					style={{
						fontSize: 10,
						letterSpacing: "0.2em",
						textTransform: "uppercase",
						color: "var(--fg-faint)",
					}}
				>
					{field}
				</div>
			) : null}
			<div style={{ color: "var(--fg)", fontSize: 13, lineHeight: 1.5 }}>
				{question}
			</div>
			{proposedValue ? (
				<div
					style={{
						padding: "6px 10px",
						border: "1px solid var(--line)",
						borderRadius: 4,
						background: "var(--bg-2)",
						fontFamily: "var(--font-mono)",
						color: "var(--accent)",
						fontSize: 13,
					}}
				>
					{proposedValue}
				</div>
			) : null}
			<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
				<button
					type="button"
					onClick={() => onReply("no, let me correct that")}
					disabled={disabled}
					style={{
						padding: "6px 12px",
						border: "1px solid var(--line)",
						borderRadius: 4,
						background: "transparent",
						color: "var(--fg-dim)",
						fontFamily: "var(--font-mono)",
						fontSize: 11,
						letterSpacing: "0.18em",
						textTransform: "uppercase",
						cursor: disabled ? "not-allowed" : "pointer",
					}}
				>
					No
				</button>
				<button
					type="button"
					onClick={() => onReply("yes")}
					disabled={disabled}
					style={{
						padding: "6px 14px",
						border: "none",
						borderRadius: 4,
						background: "var(--accent)",
						color: "var(--bg)",
						fontFamily: "var(--font-mono)",
						fontSize: 11,
						fontWeight: 600,
						letterSpacing: "0.18em",
						textTransform: "uppercase",
						cursor: disabled ? "not-allowed" : "pointer",
					}}
				>
					Yes
				</button>
			</div>
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
		<a className="artifact" href={url} target="_blank" rel="noreferrer" download>
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

type ApprovalResponseFn = (response: {
	id: string;
	approved: boolean;
}) => void | Promise<void>;

function MessageView({
	message,
	isLast,
	busy,
	backend,
	onApproval,
	onReply,
}: {
	message: UiMessage;
	isLast: boolean;
	busy: boolean;
	backend: Backend;
	onApproval: ApprovalResponseFn;
	onReply: (text: string) => void;
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

	const textParts = message.parts.filter((p) => p.type === "text") as unknown as {
		type: "text";
		text: string;
	}[];

	// Single source of truth: CVSchema.
	// Workflow emits `data-cv`; agent produces the CV as `generatePdf` tool
	// input (which pauses for approval — UI shows the preview + confirmation).
	let cv: CV | null = null;
	type ApprovalTool = {
		toolCallId?: string;
		state?: string;
		input?: unknown;
		output?: unknown;
		approval?: { id: string; status?: string };
	};
	let pdfTool: ApprovalTool | null = null;
	const askTools: ApprovalTool[] = [];
	const tryParse = (data: unknown) => {
		const result = CVSchema.safeParse(data);
		return result.success ? result.data : null;
	};
	for (const p of message.parts) {
		if (p.type === "data-cv") {
			const parsed = tryParse((p as { data?: unknown }).data);
			if (parsed) cv = parsed;
		}
		// validateCV gets the full draft as input; once valid, that draft is
		// the CV we render. This lets the preview appear BEFORE generatePdf.
		if (p.type === "tool-validateCV") {
			const vp = p as {
				state?: string;
				input?: unknown;
				output?: { valid?: boolean };
			};
			if (vp.state === "output-available" && vp.output?.valid === true) {
				const parsed = tryParse(vp.input);
				if (parsed) cv = parsed;
			}
		}
		if (p.type === "tool-generatePdf") {
			pdfTool = p as ApprovalTool;
			// Input holds the final CV; useful if validateCV didn't land in this turn.
			const parsed = tryParse((p as { input?: unknown }).input);
			if (parsed) cv = parsed;
		}
		if (p.type === "tool-askConfirmation") {
			askTools.push(p as ApprovalTool);
		}
		// Workflow backend emits plain data-confirm parts that carry the same
		// shape in `data` — merge them with tool-askConfirmation for rendering.
		if (p.type === "data-confirm") {
			const d = (p as { data?: unknown }).data as {
				field?: string;
				question?: string;
				proposedValue?: string;
			} | undefined;
			if (d) {
				askTools.push({ toolCallId: `data-confirm-${p.id ?? ""}`, input: d });
			}
		}
	}
	// Dedupe askConfirmation calls by toolCallId (stream sends multiple events).
	const askById = new Map<string, ApprovalTool>();
	askTools.forEach((p, idx) => {
		askById.set(p.toolCallId ?? `ask-${idx}`, p);
	});
	const asks = Array.from(askById.values());
	const pdfUrl =
		pdfTool && pdfTool.state === "output-available" && pdfTool.output
			? (pdfTool.output as { url?: string }).url
			: undefined;
	const pdfBytes =
		pdfTool && pdfTool.state === "output-available" && pdfTool.output
			? (pdfTool.output as { bytes?: number }).bytes
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
				<ToolBlock
					key={`step-${s.step}`}
					title={`step ${s.step} · ${STEP_LABELS[s.step] ?? s.label}`}
					done={s.status === "done"}
					result={
						s.status === "done"
							? s.step === 4
								? "pdf saved"
								: s.step === 3
									? "cv assembled"
									: "ok"
							: undefined
					}
				/>
			))}

			{toolParts.map((p, i) => {
				const name = p.type.replace(/^tool-/, "");
				const state = p.state ?? "input-streaming";
				const done =
					state === "output-available" || state === "output-error";
				const resultPreview =
					typeof p.output === "string"
						? p.output.slice(0, 120)
						: p.output
							? JSON.stringify(p.output).slice(0, 120)
							: undefined;
				return (
					<ToolBlock
						key={p.toolCallId ?? `${message.id}-tool-${i}`}
						title={`${name}()`}
						args={
							(p.input as Record<string, unknown>) ??
							undefined
						}
						done={done}
						result={resultPreview}
					/>
				);
			})}

			{lastAssistantText && (
				<AssistantLine>{lastAssistantText}</AssistantLine>
			)}

			{cv && (
				<div className="msg assistant">
					<span className="role">cv</span>
					<span className="content" style={{ border: "none", padding: 0 }}>
						<Renderer
							spec={{
								root: "cv-card",
								elements: {
									"cv-card": {
										type: "CVCard",
										props: cv as unknown as Record<string, unknown>,
										children: [],
									},
								},
							}}
							registry={registry}
						/>
					</span>
				</div>
			)}

			{isLast &&
				asks.map((ask, i) => {
					const input = (ask.input ?? {}) as {
						field?: string;
						question?: string;
						proposedValue?: string;
					};
					return (
						<div
							className="msg assistant"
							key={ask.toolCallId ?? `ask-${i}`}
						>
							<span className="role">ask</span>
							<span
								className="content"
								style={{ border: "none", padding: 0 }}
							>
								<ConfirmCard
									field={input.field}
									question={input.question ?? "Confirm?"}
									proposedValue={input.proposedValue}
									onReply={onReply}
									disabled={busy}
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
						<span className="thinking">
							<span className="d" />
							<span className="d" />
							<span className="d" />
						</span>
					</span>
				</div>
			)}
		</>
	);
}
