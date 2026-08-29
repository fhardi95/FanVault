// scripts/build-product-links.mjs
//
// Parses a Fanatics affiliate product feed CSV (the kind exported from the
// network dashboard, with columns like link_url_field, catalog_item_id_field,
// name_field, etc.) into a flat JSON lookup of prodsku -> full tracking link.
//
// Usage:
//   node scripts/build-product-links.mjs data/fanatics.csv
//
// Output:
//   lib/product-links.json   { "203470997": "https://fanatics.93n6tx.net/...", ... }
//   lib/product-index.json   [{ sku, name, category, team, price }, ...]  (for search/browse UI)
//
// Re-run this any time you get a fresh feed export — it fully overwrites
// both output files.

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/build-product-links.mjs <path-to-csv>");
  process.exit(1);
}

const csvRaw = fs.readFileSync(path.resolve(inputPath), "utf8");

const rows = parse(csvRaw, {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true,
});

const linkBySku = {};
const index = [];
let skipped = 0;

for (const row of rows) {
  const rawUrl = (row.link_url_field || "").trim();
  const sku = (row.catalog_item_id_field || "").trim();

  if (!rawUrl || !sku) {
    skipped++;
    continue;
  }

  // Guard: only keep links from the expected affiliate domain.
  if (!rawUrl.includes("fanatics.93n6tx.net")) {
    skipped++;
    continue;
  }

  linkBySku[sku] = rawUrl;

  index.push({
    sku,
    name: row.name_field || "",
    category: row.category_field || "",
    team: row.team || "",
    price: row.current_price || "",
    image: row.image_url_field || "",
  });
}

const libDir = path.resolve("lib");
fs.writeFileSync(
  path.join(libDir, "product-links.json"),
  JSON.stringify(linkBySku),
  "utf8"
);
fs.writeFileSync(
  path.join(libDir, "product-index.json"),
  JSON.stringify(index),
  "utf8"
);

console.log(`Parsed ${rows.length} rows`);
console.log(`Wrote ${Object.keys(linkBySku).length} links to lib/product-links.json`);
console.log(`Wrote ${index.length} entries to lib/product-index.json`);
if (skipped) console.log(`Skipped ${skipped} rows (missing sku/url or unexpected domain)`);
