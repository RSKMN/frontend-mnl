/** @type {import('next').NextConfig} */
const BACKEND_URL = "https://decide-lafayette-quoted-advocate.trycloudflare.com";

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
	// ── Vercel/dev proxy: all /api/v1/* requests are proxied to the backend.
	// This bypasses Cloudflare Tunnel bot-protection for browser fetch calls.
	async rewrites() {
		return [
			{
				source: "/api/v1/:path*",
				destination: `${BACKEND_URL}/api/v1/:path*`,
			},
		];
	},
	async headers() {
		return [
			{
				// Allow WASM files to be loaded cross-origin for RDKit
				source: "/_next/static/(.*).wasm",
				headers: [
					{ key: "Content-Type", value: "application/wasm" },
					{ key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
					{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
				],
			},
		];
	},
};

module.exports = nextConfig;
