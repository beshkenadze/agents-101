import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// No Next.js dev badge in the corner during the live demo.
	devIndicators: false,
	turbopack: {
		root: __dirname,
	},
};

export default nextConfig;
