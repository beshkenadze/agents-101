import { Mastra } from "@mastra/core";
import { cvAgent } from "@/lib/agents/cv-agent";
import { storage } from "@/lib/memory";

export const mastra = new Mastra({
	agents: { cvAgent },
	storage,
});
