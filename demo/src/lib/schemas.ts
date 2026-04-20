import { z } from "zod";

// ─── Single source of truth: CVSchema ────────────────────────
// Strict (required vs optional stated explicitly). Used for the final
// artifact: generatePdf input, CVCard props, validateCV pass condition.

// Note: OpenAI strict JSON-schema mode requires every property to be listed
// in `required`. We model "optional" as nullable instead — every field is
// always present but may be `null`.

export const JobSchema = z.object({
	company: z.string().min(1),
	role: z.string().min(1),
	years: z.string().nullable().describe("Free-form span, e.g. '2020–2023' or null if unknown"),
	highlights: z.array(z.string()).nullable(),
});

export const CVSchema = z.object({
	name: z.string().min(1),
	headline: z.string().nullable().describe("One-line professional summary or null"),
	skills: z.array(z.string()).min(1),
	jobs: z.array(JobSchema).min(1),
});

export type CV = z.infer<typeof CVSchema>;

// ─── Draft view: everything optional ─────────────────────────
// Derived from CVSchema; used by extractMetadata output and working memory.
// A draft can grow turn-by-turn until CVSchema.safeParse passes.

export const DraftJobSchema = z.object({
	company: z.string().optional(),
	role: z.string().optional(),
	years: z.string().optional(),
	highlights: z.array(z.string()).max(4).optional(),
});

export const DraftCVSchema = z.object({
	name: z.string().optional(),
	headline: z.string().optional(),
	skills: z.array(z.string()).optional(),
	jobs: z.array(DraftJobSchema).optional(),
});

export type DraftCV = z.infer<typeof DraftCVSchema>;

// ─── Workflow-backend helpers ───────────────────────────────
// The workflow path uses three discrete generateObject calls, each with its
// own slice of CVSchema.

export const SkillsSchema = z.object({
	skills: z.array(z.string()).describe("Flat list of distinct skills"),
});

export const JobsSchema = z.object({
	jobs: z.array(JobSchema),
});
