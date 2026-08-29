import { NextRequest, NextResponse } from "next/server";
import {
  buildFanaticsAffiliateLink,
  ALLOWED_TARGET_HOSTS,
  FANATICS_AFFILIATE,
} from "@/lib/affiliate-links";

export const dynamic = "force-dynamic";

/**
 * /go/product?url=<fanatics product URL>&sku=<optional prodsku>
 *
 * Accepts either:
 *  A) a plain fanatics.com (or other allowed shop) product URL — this route
 *     wraps it into a tracking link using your campaign IDs, e.g.
 *     /go/product?url=https://www.fanatics.com/mlb/...&sku=2002079599
 *
 *  B) an ALREADY-BUILT tracking link on fanatics.93n6tx.net (the kind you
 *     get straight from the affiliate network/product feed) — this route
 *     just passes it straight through, e.g.
 *     /go/product?url=https://fanatics.93n6tx.net/c/2495264/806573/9663?prodsku=...&u=...&intsrc=...
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

  // Case B: it's already a full tracking link on the affiliate network
  // domain — don't rebuild it, just pass it through as-is.
  if (parsed.hostname === FANATICS_AFFILIATE.domain) {
    return NextResponse.redirect(parsed.toString(), 302);
  }

  // Case A: plain product URL — guard against this being used as an open
  // redirect to random sites, then build the tracking link.
  if (!ALLOWED_TARGET_HOSTS.includes(parsed.hostname)) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  const affiliateUrl = buildFanaticsAffiliateLink(parsed.toString(), { sku });

  return NextResponse.redirect(affiliateUrl, 302);
}
