import { Mastra } from "@mastra/core";
import { cvAgent } from "@/lib/agents/cv-agent";

export const mastra = new Mastra({
	agents: { cvAgent },
});
