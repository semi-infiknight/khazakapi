import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCatalog, fetchSearch, fetchSuggest } from "../lib/api.js";
import ApiGrid from "../components/ApiGrid.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import { IntentResults } from "../components/IntentSuggest.jsx";
import KhanShatyrAnimated from "../components/KhanShatyrAnimated.jsx";
import { useCatalogueNav } from "../context/CatalogueNavContext.jsx";

export default function HomePage() {
  const { setCatalogue } = useCatalogueNav();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [category, setCategory] = useState("");
  const [auth, setAuth] = useState("");
  const [pricing, setPricing] = useState("");
  const [tier, setTier] = useState("");
  const [data, setData] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    fetchCatalog()
      .then((res) => setCatalog(res.categories))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!location.state?.category) return;
    setCategory(location.state.category);
    setSuggestion(null);
    setQuery("");
    setDebounced("");
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.category, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSearch({
      q: "",
      category,
      auth,
      pricing,
      tier,
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
  }, [category, auth, pricing, tier]);

  // Typing in search automatically runs intent suggest — no extra button.
  useEffect(() => {
    const q = debounced.trim();
    if (!q) {
      setSuggestion(null);
      setSuggesting(false);
      return undefined;
    }

    let cancelled = false;
    setSuggesting(true);
    fetchSuggest(q)
      .then((res) => {
        if (!cancelled) setSuggestion(res);
      })
      .catch((err) => {
        if (!cancelled) console.error(err);
      })
      .finally(() => {
        if (!cancelled) setSuggesting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const stats = data?.facets;
  const showingSuggest = Boolean(debounced.trim());

  const setFilter = (key, value) => {
    if (key === "category") setCategory(value);
    if (key === "auth") setAuth(value);
    if (key === "pricing") setPricing(value);
    if (key === "tier") setTier(value);
    if (value) {
      setSuggestion(null);
      setQuery("");
      setDebounced("");
    }
  };

  useEffect(() => {
    setCatalogue({
      query,
      onQueryChange: setQuery,
      facets: data?.facets,
      total: data?.catalogueTotal ?? data?.total,
      filteredTotal: showingSuggest ? suggestion?.total : data?.total,
      filters: { category, auth, pricing, tier },
      onFilterChange: setFilter,
      catalogCategories: catalog,
    });
    return () => setCatalogue(null);
  }, [query, category, auth, pricing, tier, data, catalog, suggestion, showingSuggest, setCatalogue]);

  return (
    <div className="container-main container-main--catalogue pt-6">
      <section className="hero-banner mb-8" aria-label="Khazak API">
        <KhanShatyrAnimated className="hero-banner-art" />
        <h1 className="hero-title hero-banner-title">every Kazakhstan API you need</h1>
      </section>

      <section className="stats-metal-strip mb-8 grid grid-cols-2 lg:grid-cols-4">
        <div className="stats-block flex-col items-start justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">APIs</span>
          <span className="stats-big-number">{data?.catalogueTotal ?? data?.total ?? "—"}</span>
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

      <div className="catalogue-layout">
        <CategorySidebar
          className="catalogue-sidebar-desktop"
          facets={data?.facets}
          total={data?.catalogueTotal ?? data?.total}
          filteredTotal={showingSuggest ? suggestion?.total : data?.total}
          filters={{ category, auth, pricing, tier }}
          onFilterChange={setFilter}
          catalogCategories={catalog}
        />

        <div className="catalogue-main">
          <section className="catalogue-search-desktop mb-6">
            <div className="relative">
              <input
                className="search-input"
                type="search"
                placeholder="Describe what you're building — or search Kaspi, 2GIS, weather…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search APIs"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--text-mute)]">
                {suggesting ? "…" : "⌘K"}
              </span>
            </div>
          </section>

          {showingSuggest ? (
            <div id="intent-results">
              {suggesting && !suggestion ? (
                <p className="font-mono text-sm text-[var(--text-soft)]">Finding APIs…</p>
              ) : (
                <IntentResults suggestion={suggestion} />
              )}
            </div>
          ) : loading ? (
            <p className="font-mono text-sm text-[var(--text-soft)]">Loading catalogue…</p>
          ) : (
            <ApiGrid apis={data?.apis} />
          )}
        </div>
      </div>
    </div>
  );
}
