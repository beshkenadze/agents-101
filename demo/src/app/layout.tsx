import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "Agents 101 — CV generator",
	description: "Workflow vs agent demo for the Agents 101 talk.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			data-theme="dark"
			className={`${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
		>
			<body>{children}</body>
		</html>
	);
}
