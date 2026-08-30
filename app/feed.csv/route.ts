import productIndex from "@/lib/product-index.json";

export const dynamic = "force-static";

type Product = {
  sku: string;
  name: string;
  description: string;
  category: string;
  team: string;
  price: string;
  image: string;
  manufacturer: string;
  gtin: string;
};

const BASE_URL = "https://fanvault-ochre.vercel.app";

// Escape a value for a CSV cell: wrap in quotes and double up any quotes
// inside it, per RFC 4180.
function csvCell(value: string): string {
  const v = (value ?? "").toString().replace(/\r?\n/g, " ").trim();
  return `"${v.replace(/"/g, '""')}"`;
}

/**
 * Pinterest product feed (CSV), per Pinterest's Catalogs spec:
 * https://help.pinterest.com/en/business/article/data-source-ingestion
 *
 * Required columns: id, title, description, availability, condition,
 * price, link, image_link. brand/product_type are recommended extras.
 *
 * Re-generated fresh on every request from lib/product-index.json, so it
 * always reflects whatever CSV you last imported with
 * scripts/build-product-links.mjs.
 */
export async function GET() {
  const index = productIndex as Product[];

  const seen = new Set<string>();
  const rows: string[] = [];

  rows.push(
    [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
      "product_type",
    ].join(",")
  );

  for (const p of index) {
    if (seen.has(p.sku)) continue; // dedupe repeated skus from the feed
    seen.add(p.sku);
    if (!p.name || !p.price) continue; // skip incomplete rows

    rows.push(
      [
        csvCell(p.sku),
        csvCell(p.name.slice(0, 100)),
        csvCell(p.description || p.name),
        csvCell("in stock"),
        csvCell("new"),
        csvCell(`${p.price} USD`),
        csvCell(`${BASE_URL}/product/${p.sku}`),
        csvCell(p.image),
        csvCell(p.manufacturer || p.team),
        csvCell(p.category),
      ].join(",")
    );
  }

  const csv = rows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
