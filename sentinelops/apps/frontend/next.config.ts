import type { NextConfig } from "next";

const projectRoot = new URL(".", import.meta.url).pathname;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
