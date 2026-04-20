import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { CVSchema } from "@/lib/schemas";

export const catalog = defineCatalog(schema, {
	components: {
		CVCard: {
			props: CVSchema,
			description: "Render a finalized CV with name, headline, skills, jobs.",
		},
	},
	actions: {},
});
