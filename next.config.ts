import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Optional skip for lighter Docker builds.
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPECHECK === "true",
  },
};

export default nextConfig;
