import { Mastra } from "@mastra/core";
import { cvAgent } from "@/lib/agents/cv-agent";
import { storage } from "@/lib/memory";
import { cvWorkflow } from "@/lib/workflows/cv-workflow";

export const mastra = new Mastra({
	agents: { cvAgent },
	workflows: { cvWorkflow },
	storage,
});
