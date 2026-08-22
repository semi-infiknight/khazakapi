import { useEffect, useState } from "react";
import { fetchSearch } from "../lib/api.js";
import ApiGrid from "../components/ApiGrid.jsx";
import ApiSearchList from "../components/ApiSearchList.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import { FacetChips } from "../components/Filters.jsx";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [auth, setAuth] = useState("");
  const [pricing, setPricing] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

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

  const isSearching = Boolean(debounced.trim());
  const resultLabel = loading
    ? "Loading…"
    : `${data?.total?.toLocaleString() ?? 0} API${data?.total === 1 ? "" : "s"}`;

  const pageTitle = isSearching ? `Search: ${debounced.trim()}` : category || "Discover APIs";

  return (
    <div className="hub-page">
      {!bannerDismissed && (
        <div className="container-main pt-4">
          <div className="banner-warn flex items-start justify-between gap-3">
            <span>
              data.egov.kz requires a free API key for most datasets — use the key setup page for all ~140 portal
              entries.
            </span>
            <button type="button" className="font-mono text-xs opacity-70" onClick={() => setBannerDismissed(true)}>
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="hub-layout container-main pb-16 pt-4">
        <CategorySidebar
          facets={data?.facets}
          active={category}
          onChange={setCategory}
          total={data?.total}
        />

        <div className="hub-main">
          <div className="hub-main-head">
            <div>
              <h1 className="hub-main-title">{pageTitle}</h1>
              <p className="hub-main-subtitle">
                {isSearching ? "Postman-style search results" : resultLabel} · Kazakhstan open data & integrations
              </p>
            </div>
            <div className="hub-search-wrap">
              <span className="hub-search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                className="hub-search"
                type="search"
                placeholder="Search APIs — weather, KATO, NBK rates, 2GIS…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search APIs"
              />
              <span className="hub-search-kbd">⌘K</span>
            </div>
          </div>

          <div className="hub-filters">
            <FacetChips label="Auth" items={data?.facets?.auth} active={auth} onChange={setAuth} />
            <FacetChips label="Pricing" items={data?.facets?.pricing} active={pricing} onChange={setPricing} />
          </div>

          {loading ? (
            <p className="hub-loading">Loading catalogue…</p>
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
