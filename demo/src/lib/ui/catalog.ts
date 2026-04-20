import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { ConfirmSchema, CVSchema } from "@/lib/schemas";

export const catalog = defineCatalog(schema, {
	components: {
		CVCard: {
			props: CVSchema,
			description: "Render a finalized CV with name, headline, skills, jobs.",
		},
		ConfirmCard: {
			props: ConfirmSchema,
			description:
				"Ask the user to confirm or reject a proposed value. Renders a Yes/No card.",
		},
	},
	actions: {},
});
