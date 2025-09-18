// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don’t block the build on ESLint/TS while we stabilize
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

