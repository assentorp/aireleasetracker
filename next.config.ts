import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Fast Refresh (hot reload) - enabled by default in dev
  reactStrictMode: true,

  // Optimize for development
  ...(process.env.NODE_ENV === 'development' && {
    // Disable static optimization during development for faster refresh
    experimental: {
      // Enable optimized Fast Refresh
      optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
  }),
};

export default nextConfig;
