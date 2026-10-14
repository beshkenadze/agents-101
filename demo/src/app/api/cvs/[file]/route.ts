import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CV_DIR } from "@/lib/pdf";

// Serves PDFs written by renderCVtoPdf. Only "<8 hex>.pdf" names are
// accepted, so the path cannot leave CV_DIR.
export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ file: string }> },
) {
	const { file } = await params;
	if (!/^[0-9a-f]{8}\.pdf$/.test(file)) {
		return new Response("Not found", { status: 404 });
	}
	try {
		const pdf = await readFile(join(CV_DIR, file));
		return new Response(pdf, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `inline; filename="cv-${file}"`,
				"Cache-Control": "no-store",
			},
		});
	} catch {
		return new Response("Not found", { status: 404 });
	}
}
