import { NextRequest, NextResponse } from "next/server";
import { buildFanaticsAffiliateLink, ALLOWED_TARGET_HOSTS } from "@/lib/affiliate-links";

export const dynamic = "force-dynamic";

/**
 * /go/product?url=<fanatics product URL>&sku=<optional prodsku>
 *
 * Example:
 * /go/product?url=https%3A%2F%2Fwww.fanatics.com%2Fmlb%2F...&sku=2002079599
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const sku = req.nextUrl.searchParams.get("sku") ?? undefined;

  if (!url) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // Guard against this route being used as an open redirect to random sites.
  if (!ALLOWED_TARGET_HOSTS.includes(parsed.hostname)) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  const affiliateUrl = buildFanaticsAffiliateLink(parsed.toString(), { sku });

  return NextResponse.redirect(affiliateUrl, 302);
}
