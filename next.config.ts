import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// If a parent folder (e.g. user home) has its own package-lock.json, Next may infer the wrong
// workspace root and mix tooling/chunks. Pin tracing to this app directory.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co"
      }
    ]
  },
  // Server Actions default body limit is 1 MB; uploads (logos, timeline media) need more.
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb"
    }
  }
};

export default nextConfig;
