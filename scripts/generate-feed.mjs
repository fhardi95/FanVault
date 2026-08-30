// scripts/generate-feed.mjs
//
// Generates public/feed.csv — the Pinterest product feed — as a plain
// static file at build time, rather than a server-rendered route.
//
// Why: Vercel's ISR/pre-rendered response size cap is ~19MB, and this feed
// (23k+ products) is ~22MB. Static files in public/ aren't subject to that
// cap — Vercel just serves them directly off its CDN — so generating the
// file at build time instead of on-request sidesteps the limit entirely.
//
// Runs automatically before every `next build` via the "prebuild" script
// in package.json. Re-run manually any time after regenerating
// lib/product-index.json:
//   node scripts/generate-feed.mjs

import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://fanvault-ochre.vercel.app";

const VALID_GENDERS = new Set(["male", "female", "unisex"]);
const VALID_AGE_GROUPS = new Set(["newborn", "infant", "toddler", "kids", "adult"]);

function normalizeEnum(value, allowed) {
  const v = (value || "").trim().toLowerCase();
  return allowed.has(v) ? v : "";
}

function csvCell(value) {
  const v = (value ?? "").toString().replace(/\r?\n/g, " ").trim();
  return `"${v.replace(/"/g, '""')}"`;
}

const indexPath = path.resolve("lib/product-index.json");
if (!fs.existsSync(indexPath)) {
  console.error(
    "lib/product-index.json not found — run scripts/build-product-links.mjs first."
  );
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const seen = new Set();
const rows = [];

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
  if (seen.has(p.sku)) continue;
  seen.add(p.sku);
  if (!p.name || !p.price) continue;

  const productUrl = `${BASE_URL}/product/${p.sku}`;
  const current = parseFloat(p.price);
  const original = parseFloat(p.originalPrice);
  const isDiscounted = original > 0 && current > 0 && original > current;

  rows.push(
    [
      csvCell(p.sku),
      csvCell(""),
      csvCell((p.name || "").slice(0, 100)),
      csvCell(p.description || p.name),
      csvCell(productUrl),
      csvCell(p.image),
      csvCell(isDiscounted ? p.originalPrice : p.price),
      csvCell("in stock"),
      csvCell("new"),
      csvCell("Sporting Goods > Fan Shop"),
      csvCell(p.category),
      csvCell(p.additionalImage),
      csvCell(isDiscounted ? p.price : ""),
      csvCell(p.manufacturer || p.team),
      csvCell(normalizeEnum(p.gender, VALID_GENDERS)),
      csvCell(normalizeEnum(p.ageGroup, VALID_AGE_GROUPS)),
      csvCell(""),
      csvCell(""),
      csvCell(""),
      csvCell(p.category),
      csvCell(`${productUrl}?utm_source=Pinterest&utm_campaign=shopping`),
    ].join(",")
  );
}

const outDir = path.resolve("public");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "feed.csv");
fs.writeFileSync(outPath, rows.join("\n"), "utf8");

const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
console.log(`Wrote ${rows.length - 1} products to public/feed.csv (${sizeMB} MB)`);
