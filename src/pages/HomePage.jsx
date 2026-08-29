import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCatalog, fetchSearch, fetchSuggest } from "../lib/api.js";
import ApiGrid from "../components/ApiGrid.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import { IntegrationChain, IntegrationChainLoading } from "../components/IntentSuggest.jsx";
import KhanShatyrAnimated from "../components/KhanShatyrAnimated.jsx";
import { useCatalogueNav } from "../context/CatalogueNavContext.jsx";

export default function HomePage() {
  const { setCatalogue } = useCatalogueNav();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
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

  const clearIntent = useCallback(() => {
    setSubmittedQuery("");
    setSuggestion(null);
    setSuggesting(false);
  }, []);

  useEffect(() => {
    if (!location.state?.category) return;
    setCategory(location.state.category);
    clearIntent();
    setQuery("");
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.category, location.pathname, navigate, clearIntent]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSearch({
      q: submittedQuery ? "" : query,
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
  }, [query, category, auth, pricing, tier, submittedQuery]);

  const submitIntent = useCallback(() => {
    const q = query.trim();
    if (!q) {
      clearIntent();
      return;
    }

    if (q === submittedQuery && suggestion && !suggesting) return;

    setSubmittedQuery(q);
    setSuggesting(true);
    setSuggestion(null);

    fetchSuggest(q)
      .then((res) => {
        setSuggestion(res);
        requestAnimationFrame(() => {
          document.getElementById("intent-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      })
      .catch(console.error)
      .finally(() => setSuggesting(false));
  }, [query, submittedQuery, suggestion, suggesting, clearIntent]);

  const stats = data?.facets;
  const showingIntent = Boolean(submittedQuery.trim());
  const draftChanged = showingIntent && query.trim() !== submittedQuery.trim();

  const setFilter = (key, value) => {
    if (key === "category") setCategory(value);
    if (key === "auth") setAuth(value);
    if (key === "pricing") setPricing(value);
    if (key === "tier") setTier(value);
    if (value) {
      clearIntent();
      setQuery("");
    }
  };

  useEffect(() => {
    setCatalogue({
      query,
      onQueryChange: setQuery,
      onIntentSubmit: submitIntent,
      intentSubmitting: suggesting,
      intentActive: showingIntent,
      facets: data?.facets,
      total: data?.catalogueTotal ?? data?.total,
      filteredTotal: showingIntent ? suggestion?.total : data?.total,
      filters: { category, auth, pricing, tier },
      onFilterChange: setFilter,
      catalogCategories: catalog,
    });
    return () => setCatalogue(null);
  }, [
    query,
    category,
    auth,
    pricing,
    tier,
    data,
    catalog,
    suggestion,
    showingIntent,
    suggesting,
    submitIntent,
    setCatalogue,
  ]);

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
          filteredTotal={showingIntent ? suggestion?.total : data?.total}
          filters={{ category, auth, pricing, tier }}
          onFilterChange={setFilter}
          catalogCategories={catalog}
        />

        <div className="catalogue-main">
          <section className="catalogue-search-desktop mb-6">
            <form
              className="catalogue-intent-form"
              onSubmit={(e) => {
                e.preventDefault();
                submitIntent();
              }}
            >
              <div className="relative">
                <input
                  className="search-input"
                  type="search"
                  placeholder="Describe what you're building — press Enter to get an integration chain"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Describe your product"
                />
                <button
                  type="submit"
                  className="catalogue-intent-submit"
                  disabled={!query.trim() || suggesting}
                  aria-label="Analyze integration chain"
                >
                  {suggesting ? "…" : "↵"}
                </button>
              </div>
              <p className="catalogue-intent-hint">
                {draftChanged
                  ? "Press Enter to refresh the integration chain"
                  : "Describe your app, then press Enter — we won't analyze until you submit"}
              </p>
            </form>
          </section>

          {showingIntent ? (
            <div id="intent-results">
              {suggesting ? (
                <IntegrationChainLoading query={submittedQuery} />
              ) : (
                <IntegrationChain suggestion={suggestion} />
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
