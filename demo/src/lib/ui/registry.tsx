"use client";

import { defineRegistry } from "@json-render/react";
import { ConfirmCard } from "@/components/confirm-card";
import { CVCard } from "@/components/cv-card";
import type { Confirm, CV } from "@/lib/schemas";
import { catalog } from "@/lib/ui/catalog";

export const { registry } = defineRegistry(catalog, {
	components: {
		CVCard: ({ props }) => <CVCard {...(props as CV)} />,
		ConfirmCard: ({ props }) => <ConfirmCard {...(props as Confirm)} />,
	},
});
