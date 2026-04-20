"use client";

import { defineRegistry } from "@json-render/react";
import { CVCard } from "@/components/cv-card";
import type { CV } from "@/lib/schemas";
import { catalog } from "@/lib/ui/catalog";

export const { registry } = defineRegistry(catalog, {
	components: {
		CVCard: ({ props }) => <CVCard {...(props as CV)} />,
	},
});
