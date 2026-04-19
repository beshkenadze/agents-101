import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	turbopack: {
		root: __dirname,
	},
	// AI Elements ships type mismatches vs the shipped @base-ui/react version.
	// Runtime is fine — skip type check on build for the demo.
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
