import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCatalog, fetchSearch, fetchSuggest } from "../lib/api.js";
import ApiGrid from "../components/ApiGrid.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import { IntentResults, SearchIntentForm } from "../components/IntentSuggest.jsx";
import KhanShatyrAnimated from "../components/KhanShatyrAnimated.jsx";
import { useCatalogueNav } from "../context/CatalogueNavContext.jsx";

export default function HomePage() {
  const { setCatalogue } = useCatalogueNav();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
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
    fetchCatalog()
      .then((res) => setCatalog(res.categories))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!location.state?.category) return;
    setCategory(location.state.category);
    setSuggestion(null);
    setQuery("");
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

  const stats = data?.facets;
  const showingSuggest = Boolean(suggestion);

  const setFilter = (key, value) => {
    if (key === "category") setCategory(value);
    if (key === "auth") setAuth(value);
    if (key === "pricing") setPricing(value);
    if (key === "tier") setTier(value);
    if (value) {
      setSuggestion(null);
      setQuery("");
    }
  };

  const runSuggest = async (text = query) => {
    const q = String(text || "").trim();
    if (!q) return;
    setQuery(q);
    setSuggesting(true);
    try {
      const res = await fetchSuggest(q);
      setSuggestion(res);
      requestAnimationFrame(() => {
        document.getElementById("intent-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  const clearSuggest = () => {
    setSuggestion(null);
    setQuery("");
  };

  useEffect(() => {
    setCatalogue({
      query,
      onQueryChange: setQuery,
      onIntentSubmit: (text) => runSuggest(text ?? query),
      suggesting,
      suggestionActive: showingSuggest,
      onClearSuggest: clearSuggest,
      facets: data?.facets,
      total: data?.catalogueTotal ?? data?.total,
      filteredTotal: data?.total,
      filters: { category, auth, pricing, tier },
      onFilterChange: setFilter,
      catalogCategories: catalog,
    });
    return () => setCatalogue(null);
  }, [query, suggesting, showingSuggest, category, auth, pricing, tier, data, catalog, setCatalogue]);

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
            <SearchIntentForm
              inputRef={searchRef}
              value={query}
              onChange={setQuery}
              onSubmit={runSuggest}
              onClear={clearSuggest}
              loading={suggesting}
              active={showingSuggest}
            />
          </section>

          {showingSuggest ? (
            <div id="intent-results">
              <IntentResults suggestion={suggestion} />
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
