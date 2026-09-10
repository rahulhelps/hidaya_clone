import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal OpenNext config. The app has no internal API routes or ISR, so the
// defaults (in-memory/no incremental cache) are sufficient. If you later add
// ISR or want a cache, wire an R2/KV incremental cache here.
// Docs: https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
