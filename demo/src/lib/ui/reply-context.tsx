"use client";

import { createContext, useContext } from "react";

type ReplyCtx = {
	onReply: (text: string) => void;
	disabled: boolean;
};

export const ReplyContext = createContext<ReplyCtx>({
	onReply: () => {},
	disabled: false,
});

export function useReply() {
	return useContext(ReplyContext);
}
