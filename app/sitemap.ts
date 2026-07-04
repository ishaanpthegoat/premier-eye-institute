import type { MetadataRoute } from "next";

// Required for output: "export" — metadata routes must opt into static.
export const dynamic = "force-static";

const base = "https://peicare.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/about",
    "/services",
    "/eyewear",
    "/reviews",
    "/payments-insurance",
    "/patient-resources",
    "/contact",
    "/book",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path === "/book" ? 0.9 : 0.7,
  }));
}
