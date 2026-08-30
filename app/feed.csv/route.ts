import productIndex from "@/lib/product-index.json";

export const dynamic = "force-static";

type Product = {
  sku: string;
  name: string;
  description: string;
  category: string;
  team: string;
  price: string;
  originalPrice: string;
  image: string;
  additionalImage: string;
  manufacturer: string;
  gender: string;
  ageGroup: string;
};

const BASE_URL = "https://fanvault-ochre.vercel.app";

// Pinterest accepts specific enum values only — anything else gets rejected
// or silently normalized. Map the feed's free-text values onto those, and
// drop anything that doesn't match rather than guess.
const VALID_GENDERS = new Set(["male", "female", "unisex"]);
const VALID_AGE_GROUPS = new Set(["newborn", "infant", "toddler", "kids", "adult"]);

function normalizeEnum(value: string, allowed: Set<string>): string {
  const v = value.trim().toLowerCase();
  return allowed.has(v) ? v : "";
}

// Escape a value for a CSV cell per RFC 4180.
function csvCell(value: string): string {
  const v = (value ?? "").toString().replace(/\r?\n/g, " ").trim();
  return `"${v.replace(/"/g, '""')}"`;
}

/**
 * Pinterest product feed (CSV), matching Pinterest's own official sample
 * template column-for-column:
 * id, item_group_id, title, description, link, image_link, price,
 * availability, condition, google_product_category, product_type,
 * additional_image_link, sale_price, brand, gender, age_group, size,
 * size_type, shipping, custom_label_0, adwords_redirect
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
      "item_group_id",
      "title",
      "description",
      "link",
      "image_link",
      "price",
      "availability",
      "condition",
      "google_product_category",
      "product_type",
      "additional_image_link",
      "sale_price",
      "brand",
      "gender",
      "age_group",
      "size",
      "size_type",
      "shipping",
      "custom_label_0",
      "adwords_redirect",
    ].join(",")
  );

  for (const p of index) {
    if (seen.has(p.sku)) continue; // dedupe repeated skus from the feed
    seen.add(p.sku);
    if (!p.name || !p.price) continue; // skip incomplete rows

    const productUrl = `${BASE_URL}/product/${p.sku}`;
    const current = parseFloat(p.price);
    const original = parseFloat(p.originalPrice);
    const isDiscounted = original > 0 && current > 0 && original > current;

    rows.push(
      [
        csvCell(p.sku), // id
        csvCell(""), // item_group_id — no product variants in this feed
        csvCell(p.name.slice(0, 100)), // title
        csvCell(p.description || p.name), // description
        csvCell(productUrl), // link
        csvCell(p.image), // image_link
        csvCell(isDiscounted ? p.originalPrice : p.price), // price
        csvCell("in stock"), // availability
        csvCell("new"), // condition
        csvCell("Sporting Goods > Fan Shop"), // google_product_category
        csvCell(p.category), // product_type
        csvCell(p.additionalImage), // additional_image_link
        csvCell(isDiscounted ? p.price : ""), // sale_price
        csvCell(p.manufacturer || p.team), // brand
        csvCell(normalizeEnum(p.gender, VALID_GENDERS)), // gender
        csvCell(normalizeEnum(p.ageGroup, VALID_AGE_GROUPS)), // age_group
        csvCell(""), // size
        csvCell(""), // size_type
        csvCell(""), // shipping
        csvCell(p.category), // custom_label_0
        csvCell(`${productUrl}?utm_source=Pinterest&utm_campaign=shopping`), // adwords_redirect
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
