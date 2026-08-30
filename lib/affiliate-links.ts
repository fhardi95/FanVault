/**
 * Fanatics affiliate link config + builder.
 *
 * There are two ways to use this:
 *
 * 1. STATIC MAP — hand-pick a short slug for a specific product and put the
 *    full tracking URL here. Good for a handful of featured/hero products.
 *    Visit:  /go/giants-bryce-eldridge-tee
 *
 * 2. DYNAMIC BUILDER — generate the tracking link on the fly from any
 *    fanatics.com product URL, so you don't have to hardcode every SKU.
 *    Visit:  /go/product?url=https://www.fanatics.com/mlb/...&sku=2002079599
 */

// ---- Your network/campaign identifiers (Impact Radius style) -------------
// These stay the same across all your Fanatics links, only prodsku + the
// destination URL (u=) change per product.
export const FANATICS_AFFILIATE = {
  domain: "fanatics.93n6tx.net",
  campaignId: "2495264",
  siteId: "806573",
  adId: "9663",
  intsrc: "CATF_5812",
};

// ---- 1. Static slug -> full affiliate URL map -----------------------------
// NOTE: the destination URL (u=) is deliberately DOUBLE percent-encoded —
// see the comment on buildFanaticsAffiliateLink() below for why.
export const AFFILIATE_LINKS: Record<string, string> = {
  "giants-bryce-eldridge-tee":
    "https://fanatics.93n6tx.net/c/2495264/806573/9663?prodsku=2002079599&u=" +
    encodeURIComponent(
      encodeURIComponent(
        "https://www.fanatics.com/mlb/san-francisco-giants/bryce-eldridge-san-francisco-giants-nike-womens-home-name-and-number-t-shirt-black/o-1232+t-92673327+p-91221168108121+z-9-1655615941"
      )
    ) +
    "&intsrc=CATF_5812",

  "browns-mojo-duffel-bag":
    "https://fanatics.93n6tx.net/c/2495264/806573/9663?prodsku=2245331&u=" +
    encodeURIComponent(
      encodeURIComponent(
        "https://www.fanatics.com/nfl/cleveland-browns/cleveland-browns-mojo-22-2-wheeled-duffel-bag-black/o-2461+t-25263550+p-46681505593+z-9-1908338414"
      )
    ) +
    "&intsrc=CATF_5812",

  // Add more curated products here:
  // "some-other-product": "https://fanatics.93n6tx.net/c/...&u=...&intsrc=...",
};

/**
 * Builds a Fanatics affiliate tracking URL from a plain fanatics.com product
 * page URL, so you can generate links for new products without hand-writing
 * the encoded string every time.
 *
 * IMPORTANT: the destination (`u=`) is DOUBLE percent-encoded, not single.
 * Impact Radius (the network behind fanatics.93n6tx.net) runs an extra,
 * unwanted decode pass on `u=` that treats a literal "+" as a space —
 * exactly like the old application/x-www-form-urlencoded convention. Since
 * Fanatics product URLs use "+" to separate the trailing o-/t-/p-/z- codes
 * (e.g. .../o-1232+t-92673327+p-.../), a single-encoded destination survives
 * Impact's decode as a real "+", then gets mangled into a space by their
 * extra pass — which becomes %20 in the final Fanatics URL and 404s.
 * Double-encoding absorbs that extra pass: it survives Impact's decode
 * intact and only resolves to a literal "+" on the final hop, inside a path
 * segment where +-as-space doesn't apply.
 */
export function buildFanaticsAffiliateLink(
  targetUrl: string,
  opts?: { sku?: string; intsrc?: string }
): string {
  const { domain, campaignId, siteId, adId, intsrc } = FANATICS_AFFILIATE;
  const skuPart = opts?.sku ? `prodsku=${encodeURIComponent(opts.sku)}&` : "";
  const uPart = encodeURIComponent(encodeURIComponent(targetUrl));
  const intsrcPart = encodeURIComponent(opts?.intsrc ?? intsrc);

  return `https://${domain}/c/${campaignId}/${siteId}/${adId}?${skuPart}u=${uPart}&intsrc=${intsrcPart}`;
}

/**
 * Given a full fanatics.93n6tx.net tracking URL in ANY state — correctly
 * single-encoded (straight from the feed), already double-encoded (from our
 * own fixed links), or partially re-decoded by a third party (Pinterest,
 * some link shorteners, etc.) — returns it with the `u=` parameter
 * correctly double-encoded. Safe to call on any tracking link at any point.
 *
 * How: fully decode the `u=` value (looping decodeURIComponent until it
 * stops changing, so it doesn't matter how many layers of encoding it
 * currently has), then re-encode it exactly twice.
 */
export function normalizeTrackingLink(rawTrackingUrl: string): string {
  return rawTrackingUrl.replace(/([?&]u=)([^&]*)/, (_, prefix, value) => {
    let decoded = value;
    for (let i = 0; i < 6; i++) {
      let next: string;
      try {
        next = decodeURIComponent(decoded);
      } catch {
        break;
      }
      if (next === decoded) break;
      decoded = next;
    }
    return prefix + encodeURIComponent(encodeURIComponent(decoded));
  });
}

// Only these hosts are allowed as redirect *targets* for the dynamic
// /go/product route — prevents your redirector being abused as an open
// redirect to an arbitrary site.
export const ALLOWED_TARGET_HOSTS = [
  "www.fanatics.com",
  "fanatics.com",
  "www.mlbshop.com",
  "www.nflshop.com",
  "www.nbastore.com",
  "www.nhlshop.com",
];
