import { NextRequest, NextResponse } from "next/server";
import productIndex from "@/lib/product-index.json";

export const dynamic = "force-dynamic";

type Product = {
  sku: string;
  name: string;
  category: string;
  team: string;
  price: string;
  image: string;
};

const index = productIndex as Product[];

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = index
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
    .slice(0, 30);

  return NextResponse.json({ results });
}
