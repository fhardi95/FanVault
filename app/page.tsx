import { AFFILIATE_LINKS } from "@/lib/affiliate-links";
import productIndex from "@/lib/product-index.json";
import ProductSearch from "@/components/ProductSearch";

export default function Home() {
  const curatedSlugs = Object.keys(AFFILIATE_LINKS);
  const totalProducts = (productIndex as unknown[]).length;

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>Fanatics Affiliate Redirects</h1>

      <p>
        <strong>{totalProducts.toLocaleString()}</strong> products imported
        from your feed. Search below to find a SKU, then link to{" "}
        <code>/go/p/&lt;sku&gt;</code> anywhere on your site.
      </p>

      <ProductSearch />

      {curatedSlugs.length > 0 && (
        <>
          <h2 style={{ marginTop: "2.5rem" }}>Curated short links</h2>
          <p>
            Hand-picked slugs (edit <code>lib/affiliate-links.ts</code> to add
            more):
          </p>
          <ul>
            {curatedSlugs.map((slug) => (
              <li key={slug}>
                <a href={`/go/${slug}`}>/go/{slug}</a>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 style={{ marginTop: "2.5rem" }}>Other ways to link</h2>
      <ul>
        <li>
          <code>/go/p/&lt;sku&gt;</code> — any product from your imported feed
        </li>
        <li>
          <code>/go/product?url=&lt;fanatics.com product URL&gt;&amp;sku=&lt;sku&gt;</code>{" "}
          — build a link on the fly for a product not in the feed
        </li>
      </ul>
    </main>
  );
}
