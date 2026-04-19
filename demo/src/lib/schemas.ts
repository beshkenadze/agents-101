import { z } from "zod";

export const SkillsSchema = z.object({
	skills: z.array(z.string()).describe("Flat list of distinct skills"),
});

export const JobSchema = z.object({
	company: z.string(),
	role: z.string(),
	years: z.string().describe("Free-form span, e.g. '2020–2023' or '1 year'"),
	highlights: z.array(z.string()).max(4),
});

export const JobsSchema = z.object({
	jobs: z.array(JobSchema),
});

export const CVSchema = z.object({
	name: z.string(),
	headline: z.string().describe("One-line professional summary"),
	skills: z.array(z.string()),
	jobs: z.array(JobSchema),
});

export type CV = z.infer<typeof CVSchema>;
