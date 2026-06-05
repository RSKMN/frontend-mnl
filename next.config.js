/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	compress: true,
	poweredByHeader: false,
	// Enforce ESLint during build to ensure validation
	eslint: {
		ignoreDuringBuilds: false,
	},
	// Enforce TypeScript build validation
	typescript: {
		ignoreBuildErrors: false,
	},
	// output: "standalone", // Temporarily disabled for debugging
	images: {
		formats: ["image/avif", "image/webp"],
	},
	webpack: (config) => {
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			path: false,
			crypto: false,
		};
		return config;
	},
};

module.exports = nextConfig;
