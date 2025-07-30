import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // to be removed in future
  },
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
