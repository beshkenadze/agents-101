import type { CV } from "@/lib/schemas";

export function CVCard({ name, headline, skills, jobs }: CV) {
	return (
		<div className="cv-card">
			<div className="cv-head">
				<div className="cv-name">{name}</div>
				<div className="cv-headline">{headline}</div>
			</div>

			<div className="cv-section">
				<div className="cv-label">// skills</div>
				<div className="cv-pills">
					{skills.map((s) => (
						<span key={s} className="cv-pill">
							{s}
						</span>
					))}
				</div>
			</div>

			<div className="cv-section">
				<div className="cv-label">// experience</div>
				{jobs.map((j, ji) => {
					const highlights = j.highlights ?? [];
					return (
						<div key={`${j.company}-${ji}`} className="cv-job">
							<div className="cv-job-head">
								<span className="cv-role">{j.role}</span>
								<span className="cv-at"> @ </span>
								<span className="cv-company">{j.company}</span>
								{j.years ? (
									<span className="cv-years"> · {j.years}</span>
								) : null}
							</div>
							{highlights.length > 0 && (
								<ul className="cv-highlights">
									{highlights.map((h, hi) => (
										<li key={`${ji}-${hi}`}>{h}</li>
									))}
								</ul>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
