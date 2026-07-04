import type { MetadataRoute } from "next";

// Required for output: "export" — metadata routes must opt into static.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://peicare.com/sitemap.xml",
  };
}
