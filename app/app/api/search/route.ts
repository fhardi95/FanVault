import { NextRequest, NextResponse } from "next/server";
import productIndex from "@/lib/product-index.json";

export const dynamic = "force-dynamic";

type Product = {
  sku: string;
  name: string;
  description: string;
  category: string;
  team: string;
  price: string;
  image: string;
};

const index = productIndex as Product[];

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const category = req.nextUrl.searchParams.get("category") || "";
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(60, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "36", 10) || 36));

  let filtered = index;

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (q.length >= 2) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const pageResults = filtered.slice(start, start + limit).map((p) => ({
    ...p,
    link: `/go/p/${p.sku}`,
  }));

  return NextResponse.json({
    results: pageResults,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}
