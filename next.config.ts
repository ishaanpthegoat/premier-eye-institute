import type { NextConfig } from "next";
import path from "path";

/* This config serves TWO deploy targets from one repo:

   1. GitHub Pages (`npm run deploy:pages`) — a static export served from the
      /premier-eye-institute subpath. scripts/deploy-pages.mjs sets
      NEXT_PUBLIC_BASE_PATH, which is our signal to switch into export mode.
      A static export cannot send HTTP headers, so its CSP ships as a <meta>
      tag in app/layout.tsx (rendered only in this mode).

   2. Vercel (default build — no NEXT_PUBLIC_BASE_PATH) — a full Next.js app at
      the root that CAN send real HTTP security headers (HSTS, X-Frame-Options,
      frame-ancestors, etc. — impossible on Pages). See SECURITY_TODO.md.

   Both targets stay working: Pages remains the backup deploy. */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isPagesBuild = basePath !== "";

/* HTTP security headers — only emitted on the Vercel (non-export) build, and
   only in production so they don't break Turbopack HMR in `next dev`. The CSP
   mirrors the <meta> policy in app/layout.tsx and additionally sets
   frame-ancestors, which a <meta> CSP cannot enforce. */
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' blob:",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    // Kept unoptimized in both modes so image rendering is identical to the
    // Pages build; export mode also requires it. (Vercel image optimization
    // can be enabled later as a separate change.)
    unoptimized: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
  ...(isPagesBuild
    ? { output: "export" as const, basePath }
    : {
        async headers() {
          if (process.env.NODE_ENV !== "production") return [];
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
