import { useEffect, useState } from "react";
import { fetchCatalog, fetchSearch } from "../lib/api.js";
import ApiGrid from "../components/ApiGrid.jsx";
import ApiSearchList from "../components/ApiSearchList.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import CatalogBrowseStrip from "../components/CatalogBrowseStrip.jsx";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [auth, setAuth] = useState("");
  const [pricing, setPricing] = useState("");
  const [data, setData] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    fetchCatalog()
      .then((res) => setCatalog(res.categories))
      .catch(console.error);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSearch({
      q: debounced,
      category,
      auth,
      pricing,
      limit: 200,
    })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, category, auth, pricing]);

  const stats = data?.facets;
  const isSearching = Boolean(debounced.trim());

  const setFilter = (key, value) => {
    if (key === "category") setCategory(value);
    if (key === "auth") setAuth(value);
    if (key === "pricing") setPricing(value);
  };

  return (
    <div className="container-main pb-16 pt-6">
      {!bannerDismissed && (
        <div className="banner-warn mb-4 flex items-start justify-between gap-3">
          <span>
            ⚠ data.egov.kz requires an API key for most datasets — entries marked Copy-paste use keyless endpoints
            (NBK RSS, Kazhydromet WIS2). Counts reflect the local Kazakhstan catalogue.
          </span>
          <button type="button" className="font-mono text-xs opacity-70" onClick={() => setBannerDismissed(true)}>
            ✕
          </button>
        </div>
      )}

      <section className="mb-8">
        <div className="bento-label-plate mb-3">KHAZAK API · 2026</div>
        <h1 className="hero-title">every Kazakhstan API you need</h1>
        <p className="mt-3 max-w-2xl text-[var(--text-soft)]">
          Astana · Almaty · Shymkent · +7 — government open data, Kaspi, 2GIS, NBK KZT rates, eGov, and local
          providers only. No global SaaS filler.
        </p>

        <div className="hero-metal-card mt-6 max-w-3xl">
          <div className="hero-metal-line">🇰🇿 KZ-first · KZT · +7 · data.egov.kz</div>
        </div>
      </section>

      <section className="stats-metal-strip mb-8 grid grid-cols-2 lg:grid-cols-4">
        <div className="stats-block flex-col items-start justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">APIs</span>
          <span className="stats-big-number">{data?.total ?? "—"}</span>
        </div>
        <div className="stats-block flex-col items-start justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">Free</span>
          <span className="stats-big-number">{stats?.pricing?.free ?? "—"}</span>
        </div>
        <div className="stats-block flex-col items-start justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">No auth</span>
          <span className="stats-big-number">{stats?.auth?.none ?? "—"}</span>
        </div>
        <div className="stats-block flex-col items-start justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">Categories</span>
          <span className="stats-big-number">{Object.keys(stats?.category || {}).length || "—"}</span>
        </div>
      </section>

      {!isSearching && catalog && <CatalogBrowseStrip categories={catalog} />}

      <div className="catalogue-layout">
        <CategorySidebar
          facets={data?.facets}
          total={data?.catalogueTotal ?? data?.total}
          filteredTotal={data?.total}
          filters={{ category, auth, pricing }}
          onFilterChange={setFilter}
        />

        <div className="catalogue-main">
          <section className="mb-6">
            <div className="relative">
              <input
                className="search-input"
                type="search"
                placeholder="Search APIs — weather, KATO, Kaspi, 2GIS, NBK rates…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search APIs"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--text-mute)]">
                ⌘K
              </span>
            </div>
          </section>

          {loading ? (
            <p className="font-mono text-sm text-[var(--text-soft)]">Loading catalogue…</p>
          ) : isSearching ? (
            <ApiSearchList apis={data?.apis} query={debounced.trim()} total={data?.total} />
          ) : (
            <ApiGrid apis={data?.apis} />
          )}
        </div>
      </div>
    </div>
  );
}
