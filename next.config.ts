import type { NextConfig } from "next";
import path from "path";

/* Static export so the site can deploy anywhere (GitHub Pages, Vercel,
   any static host). NEXT_PUBLIC_BASE_PATH is set by the Pages workflow
   ("/premier-eye-institute") because project pages live at a subpath;
   locally and on a real domain it stays empty. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    // next/image optimization needs a server; the export is fully static.
    unoptimized: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
