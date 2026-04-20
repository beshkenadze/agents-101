"use client";

import type { Confirm } from "@/lib/schemas";
import { useReply } from "@/lib/ui/reply-context";

export function ConfirmCard({ field, question, proposedValue }: Confirm) {
	const { onReply, disabled } = useReply();
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
