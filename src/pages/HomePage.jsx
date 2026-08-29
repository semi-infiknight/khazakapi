import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCatalog, fetchSearch, fetchSuggest } from "../lib/api.js";
import ApiGrid from "../components/ApiGrid.jsx";
import ApiSearchList from "../components/ApiSearchList.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import IntentSuggest, { IntentResults } from "../components/IntentSuggest.jsx";
import KhanShatyrAnimated from "../components/KhanShatyrAnimated.jsx";
import { useCatalogueNav } from "../context/CatalogueNavContext.jsx";

export default function HomePage() {
  const { setCatalogue } = useCatalogueNav();
  const location = useLocation();
  const navigate = useNavigate();
  const [intent, setIntent] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [auth, setAuth] = useState("");
  const [pricing, setPricing] = useState("");
  const [tier, setTier] = useState("");
  const [data, setData] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (!location.state?.category) return;
    setCategory(location.state.category);
    setSuggestion(null);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.category, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSearch({
      q: suggestion ? "" : debounced,
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
  }, [debounced, category, auth, pricing, tier, suggestion]);

  const stats = data?.facets;
  const isSearching = Boolean(debounced.trim()) && !suggestion;
  const showingSuggest = Boolean(suggestion);

  const setFilter = (key, value) => {
    if (key === "category") setCategory(value);
    if (key === "auth") setAuth(value);
    if (key === "pricing") setPricing(value);
    if (key === "tier") setTier(value);
    if (value) setSuggestion(null);
  };

  const runIntentFromDock = async (text) => {
    const q = (text ?? intent ?? query).trim();
    if (!q) return;
    setIntent(q);
    setQuery(q);
    try {
      const res = await fetchSuggest(q);
      setSuggestion(res);
      document.getElementById("intent-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setCatalogue({
      query: intent || query,
      onQueryChange: (value) => {
        setIntent(value);
        setQuery(value);
      },
      onIntentSubmit: () => runIntentFromDock(intent || query),
      facets: data?.facets,
      total: data?.catalogueTotal ?? data?.total,
      filteredTotal: data?.total,
      filters: { category, auth, pricing, tier },
      onFilterChange: setFilter,
      catalogCategories: catalog,
    });
    return () => setCatalogue(null);
  }, [intent, query, category, auth, pricing, tier, data, catalog, setCatalogue]);

  return (
    <div className="container-main container-main--catalogue pt-6">
      <section className="hero-banner mb-8" aria-label="Khazak API">
        <KhanShatyrAnimated className="hero-banner-art" />
        <h1 className="hero-title hero-banner-title">every Kazakhstan API you need</h1>
      </section>

      <IntentSuggest
        className="mb-8"
        value={intent}
        onChange={setIntent}
        active={showingSuggest}
        onResults={(res) => {
          setSuggestion(res);
          setQuery("");
          setDebounced("");
          requestAnimationFrame(() => {
            document.getElementById("intent-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }}
        onClear={() => {
          setSuggestion(null);
          setIntent("");
          setQuery("");
        }}
      />

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

      {showingSuggest ? (
        <div id="intent-results" className="mb-10">
          <IntentResults suggestion={suggestion} />
        </div>
      ) : (
        <div className="catalogue-layout">
          <CategorySidebar
            className="catalogue-sidebar-desktop"
            facets={data?.facets}
            total={data?.catalogueTotal ?? data?.total}
            filteredTotal={data?.total}
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
                  placeholder="Or browse by name — weather, KATO, Kaspi, 2GIS…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Browse APIs by name"
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
      )}
    </div>
  );
}
