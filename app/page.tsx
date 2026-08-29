import { AFFILIATE_LINKS } from "@/lib/affiliate-links";

export default function Home() {
  const slugs = Object.keys(AFFILIATE_LINKS);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>Fanatics Affiliate Redirects</h1>
      <p>
        Static links (edit <code>lib/affiliate-links.ts</code> to add more):
      </p>
      <ul>
        {slugs.map((slug) => (
          <li key={slug}>
            <a href={`/go/${slug}`}>/go/{slug}</a>
          </li>
        ))}
      </ul>
      <p>
        Dynamic link builder: <code>/go/product?url=&lt;fanatics product URL&gt;&amp;sku=&lt;sku&gt;</code>
      </p>
    </main>
  );
}
