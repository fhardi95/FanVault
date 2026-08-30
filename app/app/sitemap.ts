import type { MetadataRoute } from "next";
import productIndex from "@/lib/product-index.json";

type Product = { sku: string };

const BASE_URL = "https://fanvault-ochre.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const index = productIndex as Product[];

  const seen = new Set<string>();
  const uniqueProducts = index.filter((p) => {
    if (seen.has(p.sku)) return false;
    seen.add(p.sku);
    return true;
  });

  const productUrls: MetadataRoute.Sitemap = uniqueProducts.map((p) => ({
    url: `${BASE_URL}/product/${p.sku}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...productUrls,
  ];
}
