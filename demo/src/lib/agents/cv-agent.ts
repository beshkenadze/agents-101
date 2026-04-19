import { Agent } from "@mastra/core/agent";
import { extractSkills } from "@/lib/tools/extract-skills";
import { formatExperience } from "@/lib/tools/format-experience";
import { generatePdf } from "@/lib/tools/generate-pdf";
import { webSearch } from "@/lib/tools/web-search";

export const cvAgent = new Agent({
	id: "cv-agent",
	name: "CV Agent",
	model: "openai/gpt-5-mini",
	instructions: `
You turn free-form user messages into a structured CV.

Process:
1. Call extractSkills on the user's message to get skills.
2. Call formatExperience on the same message to structure work history.
3. Combine into a CV: { name, headline, skills[], jobs[] }.
4. Use webSearch only if the user mentions a company you can't place — one search max.
5. Use generatePdf only if the user asks for a PDF / export / download.

Rules:
- Never invent facts. If something is missing, say so.
- Keep everything terse. A CV is not a cover letter.
- Always reply with the final CV as a JSON code block. If a PDF was generated, add its URL below.
`.trim(),
	tools: { extractSkills, formatExperience, generatePdf, webSearch },
});
