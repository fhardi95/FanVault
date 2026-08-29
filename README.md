# Fanatics Affiliate Redirect (Next.js)

Two ways to redirect visitors to your Fanatics affiliate links.

## 1. Static, curated links

Edit `lib/affiliate-links.ts` and add an entry to `AFFILIATE_LINKS`:

```ts
export const AFFILIATE_LINKS: Record<string, string> = {
  "giants-bryce-eldridge-tee": "https://fanatics.93n6tx.net/c/...&u=...&intsrc=...",
};
```

Then link to `/go/giants-bryce-eldridge-tee` anywhere on your site
(product cards, blog posts, buttons). Visiting that URL 302-redirects
straight to the full Fanatics tracking link.

## 2. Dynamic — build the link from any product URL

No need to hand-encode anything. Link to:

```
/go/product?url=https://www.fanatics.com/mlb/san-francisco-giants/bryce-eldridge-.../o-1232+t-92673327+p-91221168108121+z-9-1655615941&sku=2002079599
```

The route builds the full `fanatics.93n6tx.net/c/.../u=...&intsrc=...`
tracking URL for you and redirects. Only hosts listed in
`ALLOWED_TARGET_HOSTS` (fanatics.com, mlbshop.com, nflshop.com, etc.) are
accepted, so the route can't be abused as an open redirect.

Your campaign IDs (`campaignId`, `siteId`, `adId`, `intsrc`) live in the
`FANATICS_AFFILIATE` object at the top of `lib/affiliate-links.ts` — update
them there if your network ever issues new ones.

## Run it

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000` to see the list of configured links.

## Deploy

Push to GitHub and import into Vercel, or run `npm run build && npm start`
on any Node host.
