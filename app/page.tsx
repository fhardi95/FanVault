import { AFFILIATE_LINKS } from "@/lib/affiliate-links";
import productIndex from "@/lib/product-index.json";
import ProductCatalog from "@/components/ProductCatalog";

type Product = { category: string };

export default function Home() {
  const curatedSlugs = Object.keys(AFFILIATE_LINKS);
  const index = productIndex as Product[];
  const totalProducts = index.length;

  const counts: Record<string, number> = {};
  for (const p of index) counts[p.category] = (counts[p.category] || 0) + 1;
  const topCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count]) => ({ category, count }));

  return (
    <main className="page">
      <header className="hero">
        <div className="hero-eyebrow">FanVault · Affiliate Catalog</div>
        <h1 className="hero-title">
          <span className="hero-title-line">{totalProducts.toLocaleString()}</span>
          <span className="hero-title-sub">licensed products, one click away</span>
        </h1>
        <p className="hero-copy">
          Search the full Fanatics catalog and grab a clean tracking link for
          any product — no encoding, no broken redirects.
        </p>
      </header>

      <ProductCatalog categories={topCategories} totalProducts={totalProducts} />

      {curatedSlugs.length > 0 && (
        <section className="curated">
          <h2 className="section-title">Curated Short Links</h2>
          <ul className="curated-list">
            {curatedSlugs.map((slug) => (
              <li key={slug}>
                <a href={`/go/${slug}`}>/go/{slug}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="page-footer">
        <code>/go/p/&lt;sku&gt;</code> — direct product link ·{" "}
        <code>/go/product?url=…</code> — build one on the fly
      </footer>

      <style>{`
        :global(html) {
          background: #0b0e14;
        }
        :global(body) {
          background: #0b0e14;
          color: #edeff2;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .page {
          max-width: 1180px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }
        .hero {
          margin-bottom: 40px;
        }
        .hero-eyebrow {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #17b8a6;
          margin-bottom: 14px;
        }
        .hero-title {
          margin: 0 0 14px;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 14px;
        }
        .hero-title-line {
          font-size: clamp(2.4rem, 6vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffb100;
          font-variant-numeric: tabular-nums;
        }
        .hero-title-sub {
          font-size: clamp(1.1rem, 2.4vw, 1.5rem);
          font-weight: 700;
          color: #edeff2;
          text-transform: uppercase;
          letter-spacing: 0.01em;
        }
        .hero-copy {
          color: #8a93a6;
          font-size: 1rem;
          max-width: 560px;
          line-height: 1.5;
          margin: 0;
        }
        .section-title {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b7385;
          margin: 0 0 12px;
        }
        .curated {
          margin-top: 56px;
          padding-top: 28px;
          border-top: 1px solid #1c2333;
        }
        .curated-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .curated-list a {
          color: #17b8a6;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.85rem;
          text-decoration: none;
        }
        .curated-list a:hover {
          text-decoration: underline;
        }
        .page-footer {
          margin-top: 48px;
          padding-top: 20px;
          border-top: 1px solid #1c2333;
          color: #6b7385;
          font-size: 0.78rem;
        }
        .page-footer code {
          color: #8a93a6;
        }
      `}</style>
    </main>
  );
}
