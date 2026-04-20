import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { DraftCVSchema } from "@/lib/schemas";

export const storage = new LibSQLStore({
	id: "cv-agent-storage",
	url: process.env.MASTRA_DB_URL ?? "file:./mastra.db",
});

// Structured per-thread scratchpad with a Zod schema. The agent reads its
// current state at the start of every turn and updates fields via the
// auto-generated update-working-memory tool. Prevents re-extracting data
// already on file.
export const memory = new Memory({
	storage,
	options: {
		lastMessages: 20,
		workingMemory: {
			enabled: true,
			schema: DraftCVSchema,
		},
	},
});
