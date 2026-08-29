import { NextRequest, NextResponse } from "next/server";
import { AFFILIATE_LINKS } from "@/lib/affiliate-links";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const target = AFFILIATE_LINKS[params.slug];

  if (!target) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // 302 (temporary) keeps SEO value on your own /go/ URL and lets you swap
  // the destination later without breaking anything that linked to it.
  return NextResponse.redirect(target, 302);
}
