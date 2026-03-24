import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "prisma", "node-cron"],
};

export default nextConfig;
