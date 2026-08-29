"use client";

import { useEffect, useState } from "react";

type Product = {
  sku: string;
  name: string;
  category: string;
  team: string;
  price: string;
  image: string;
};

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        // aborted or failed — ignore
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <input
        type="text"
        placeholder="Search products (e.g. Ohtani, Cubs, Celtics)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "0.6rem 0.8rem",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: 6,
        }}
      />

      {loading && <p style={{ color: "#888" }}>Searching…</p>}

      {results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {results.map((p) => (
            <li
              key={p.sku}
              style={{
                padding: "0.6rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <a href={`/go/p/${p.sku}`} style={{ fontWeight: 600 }}>
                {p.name}
              </a>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                {p.team} {p.team && p.category ? "·" : ""} {p.category}{" "}
                {p.price ? `· $${p.price}` : ""} · SKU {p.sku} ·{" "}
                <code>/go/p/{p.sku}</code>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
