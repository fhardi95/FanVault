import type { MetadataRoute } from "next";

const BASE_URL = "https://fanvault-ochre.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
