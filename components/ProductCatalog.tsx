"use client";

import { useEffect, useRef, useState } from "react";

type Product = {
  sku: string;
  name: string;
  description: string;
  category: string;
  team: string;
  price: string;
  image: string;
  link: string;
};

type CategoryCount = { category: string; count: number };

export default function ProductCatalog({
  categories,
  totalProducts,
}: {
  categories: CategoryCount[];
  totalProducts: number;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  function fetchPage(targetPage: number, replace: boolean) {
    const id = ++requestId.current;
    setLoading(true);

    const params = new URLSearchParams();
    if (query.trim().length >= 2) params.set("q", query.trim());
    if (activeCategory) params.set("category", activeCategory);
    params.set("page", String(targetPage));
    params.set("limit", "36");

    fetch(`/api/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (id !== requestId.current) return; // stale response, ignore
        setResults((prev) => (replace ? data.results : [...prev, ...data.results]));
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setPage(targetPage);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }

  useEffect(() => {
    const timeout = setTimeout(() => fetchPage(1, true), 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory]);

  return (
    <div>
      <div className="controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search players, teams, products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <div className="pills" role="tablist" aria-label="Filter by league">
          <button
            className={`pill ${activeCategory === null ? "pill-active" : ""}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.category}
              className={`pill ${activeCategory === c.category ? "pill-active" : ""}`}
              onClick={() =>
                setActiveCategory(activeCategory === c.category ? null : c.category)
              }
            >
              {c.category}
            </button>
          ))}
        </div>
      </div>

      <div className="result-count">
        {loading && results.length === 0
          ? "Loading…"
          : `${total.toLocaleString()} of ${totalProducts.toLocaleString()} products`}
      </div>

      <div className="grid">
        {results.map((p, i) => (
          <a key={`${p.sku}-${i}`} href={`/product/${p.sku}`} className="card">
            <div className="card-image-wrap">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" loading="lazy" className="card-image" />
              ) : (
                <div className="card-image-fallback" />
              )}
              <span className="card-sku">#{p.sku.slice(-5)}</span>
              {p.category && <span className="card-league">{p.category}</span>}
            </div>
            <div className="card-body">
              <h3 className="card-name">{p.name}</h3>
              {p.description && <p className="card-desc">{p.description}</p>}
              <div className="card-footer">
                {p.price && <span className="card-price">${p.price}</span>}
                <span className="card-cta">View →</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <div className="empty">No products match that search.</div>
      )}

      {page < totalPages && (
        <div className="load-more-wrap">
          <button
            className="load-more"
            onClick={() => fetchPage(page + 1, false)}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      <style jsx>{`
        .controls {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 8px;
        }
        .search-input {
          width: 100%;
          padding: 14px 18px;
          font-size: 1rem;
          background: #131826;
          border: 1px solid #232b3d;
          border-radius: 10px;
          color: #edeff2;
          outline: none;
        }
        .search-input:focus {
          border-color: #ffb100;
        }
        .search-input::placeholder {
          color: #6b7385;
        }
        .pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pill {
          padding: 6px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: 999px;
          border: 1px solid #232b3d;
          background: transparent;
          color: #9aa3b5;
          cursor: pointer;
        }
        .pill:hover {
          border-color: #ffb100;
          color: #edeff2;
        }
        .pill-active {
          background: #ffb100;
          border-color: #ffb100;
          color: #0b0e14;
        }
        .result-count {
          color: #6b7385;
          font-size: 0.85rem;
          margin: 18px 0 14px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 18px;
        }
        .card {
          display: flex;
          flex-direction: column;
          background: #131826;
          border: 1px solid #232b3d;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .card:hover {
          border-color: #ffb100;
          transform: translateY(-2px);
        }
        .card-image-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          background: #0b0e14;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 10px;
        }
        .card-image-fallback {
          width: 100%;
          height: 100%;
        }
        .card-sku {
          position: absolute;
          top: 8px;
          left: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(11, 14, 20, 0.85);
          color: #ffb100;
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid #232b3d;
        }
        .card-league {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(23, 184, 166, 0.15);
          color: #17b8a6;
          padding: 2px 8px;
          border-radius: 5px;
          border: 1px solid rgba(23, 184, 166, 0.35);
        }
        .card-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .card-name {
          font-size: 0.92rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 0;
          color: #edeff2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-desc {
          font-size: 0.8rem;
          color: #8a93a6;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-footer {
          margin-top: auto;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-price {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 700;
          color: #ffb100;
          font-size: 0.9rem;
        }
        .card-cta {
          font-size: 0.75rem;
          font-weight: 700;
          color: #17b8a6;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .empty {
          padding: 60px 0;
          text-align: center;
          color: #6b7385;
        }
        .load-more-wrap {
          display: flex;
          justify-content: center;
          margin: 32px 0 8px;
        }
        .load-more {
          padding: 12px 28px;
          background: transparent;
          border: 1px solid #232b3d;
          border-radius: 8px;
          color: #edeff2;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .load-more:hover {
          border-color: #ffb100;
          color: #ffb100;
        }
        .load-more:disabled {
          opacity: 0.5;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
