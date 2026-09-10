import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Enables OpenNext's Cloudflare bindings (env, assets, etc.) during `next dev`,
// so local dev matches the deployed Worker. No-op outside of dev.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
