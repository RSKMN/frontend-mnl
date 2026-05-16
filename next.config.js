/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	compress: true,
	poweredByHeader: false,
	// output: "standalone", // Temporarily disabled for debugging
	images: {
		formats: ["image/avif", "image/webp"],
	},
};

module.exports = nextConfig;
