import type { Metadata } from "next";
import { notFound } from "next/navigation";
import productIndex from "@/lib/product-index.json";

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

function findProduct(sku: string): Product | undefined {
  return index.find((p) => p.sku === sku);
}

export async function generateMetadata({
  params,
}: {
  params: { sku: string };
}): Promise<Metadata> {
  const product = findProduct(params.sku);

  if (!product) {
    return { title: "Product not found — FanVault" };
  }

  const title = `${product.name} — FanVault`;
  const description =
    product.description?.slice(0, 160) ||
    `${product.name} — ${product.team} ${product.category} gear.`;

  return {
    title,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image ? [{ url: product.image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default function ProductPage({ params }: { params: { sku: string } }) {
  const product = findProduct(params.sku);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image || undefined,
    category: product.category,
    brand: product.team ? { "@type": "Brand", name: product.team } : undefined,
    offers: product.price
      ? {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `/go/p/${product.sku}`,
        }
      : undefined,
  };

  return (
    <main className="page">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a href="/" className="back-link">
        ← Back to catalog
      </a>

      <div className="product">
        <div className="product-image-wrap">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="product-image" />
          ) : (
            <div className="product-image-fallback" />
          )}
        </div>

        <div className="product-info">
          {product.category && <span className="product-league">{product.category}</span>}
          <h1 className="product-name">{product.name}</h1>
          {product.team && <div className="product-team">{product.team}</div>}
          {product.price && <div className="product-price">${product.price}</div>}
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}

          <a
            href={`/go/p/${product.sku}`}
            className="product-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Product →
          </a>
        </div>
      </div>

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
          max-width: 1000px;
          margin: 0 auto;
          padding: 32px 24px 80px;
        }
        .back-link {
          display: inline-block;
          color: #17b8a6;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 32px;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .product {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 720px) {
          .product {
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }
        }
        .product-image-wrap {
          background: #131826;
          border: 1px solid #232b3d;
          border-radius: 14px;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 24px;
        }
        .product-image-fallback {
          width: 100%;
          height: 100%;
        }
        .product-league {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(23, 184, 166, 0.15);
          color: #17b8a6;
          padding: 4px 10px;
          border-radius: 5px;
          border: 1px solid rgba(23, 184, 166, 0.35);
          margin-bottom: 14px;
        }
        .product-name {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 800;
          line-height: 1.25;
          margin: 0 0 8px;
          color: #edeff2;
        }
        .product-team {
          color: #8a93a6;
          font-size: 0.95rem;
          margin-bottom: 14px;
        }
        .product-price {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffb100;
          margin-bottom: 22px;
        }
        .product-description {
          color: #b5bcc9;
          line-height: 1.65;
          font-size: 0.95rem;
          margin: 0 0 28px;
        }
        .product-cta {
          display: inline-block;
          background: #ffb100;
          color: #0b0e14;
          font-weight: 800;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 0.9rem;
          letter-spacing: 0.02em;
        }
        .product-cta:hover {
          background: #ffc333;
        }
      `}</style>
    </main>
  );
}
