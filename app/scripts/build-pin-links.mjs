import fs from "node:fs";
import { stringify } from "csv-stringify/sync";

const DOMAIN = "https://fanvault-ochre.vercel.app";

const links = JSON.parse(fs.readFileSync("lib/product-links.json", "utf8"));
const index = JSON.parse(fs.readFileSync("lib/product-index.json", "utf8"));

const seen = new Set();
const rows = [];

for (const p of index) {
  if (seen.has(p.sku)) continue;
  if (!links[p.sku]) continue; // skip any sku that didn't make it into the link map
  seen.add(p.sku);

  rows.push({
    sku: p.sku,
    name: p.name,
    team: p.team,
    category: p.category,
    price: p.price,
    image: p.image,
    pin_link: `${DOMAIN}/go/p/${p.sku}`,
  });
}

const out = stringify(rows, { header: true });
fs.writeFileSync("pinterest-links.csv", out, "utf8");
console.log(`Wrote ${rows.length} rows to pinterest-links.csv`);
