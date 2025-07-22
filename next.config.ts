import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //Temporary only for testing deployment with github actions
  //TODO: Remove this once I deploy
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
