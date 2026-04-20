import type { DraftCV } from "@/lib/schemas";

export function mergeDraft(prior: DraftCV, next: DraftCV): DraftCV {
	return {
		name: next.name ?? prior.name,
		headline: next.headline ?? prior.headline,
		skills: mergeSkills(prior.skills, next.skills),
		jobs: mergeJobs(prior.jobs ?? [], next.jobs ?? []),
	};
}

function mergeSkills(a?: string[], b?: string[]) {
	if (!a && !b) return undefined;
	return Array.from(new Set<string>([...(a ?? []), ...(b ?? [])]));
}

function mergeJobs(
	prior: NonNullable<DraftCV["jobs"]>,
	next: NonNullable<DraftCV["jobs"]>,
) {
	if (next.length === 0) return prior;
	if (prior.length === 0) return next;

	// Match by role (case-insensitive); otherwise append.
	const byRole = new Map<string, (typeof prior)[number]>();
	for (const j of prior) {
		if (j.role) byRole.set(j.role.toLowerCase(), j);
	}
	const result = [...prior];
	for (const nj of next) {
		const key = nj.role?.toLowerCase() ?? "";
		const existing = key ? byRole.get(key) : undefined;
		if (existing) {
			Object.assign(existing, {
				company: nj.company ?? existing.company,
				role: nj.role ?? existing.role,
				years: nj.years ?? existing.years,
				highlights:
					nj.highlights && nj.highlights.length > 0
						? nj.highlights
						: existing.highlights,
			});
		} else {
			result.push(nj);
		}
	}
	return result;
}
