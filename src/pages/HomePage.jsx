import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSearch, fetchSuggest } from "../lib/api.js";
import ApiGrid from "../components/ApiGrid.jsx";
import { IntentResults } from "../components/IntentSuggest.jsx";
import KhanShatyrAnimated from "../components/KhanShatyrAnimated.jsx";
import { useCatalogueNav } from "../context/CatalogueNavContext.jsx";

const PAGE_SIZE = 24;

export default function HomePage() {
  const { setCatalogue } = useCatalogueNav();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [apis, setApis] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const clearIntent = useCallback(() => {
    setSubmittedQuery("");
    setSuggestion(null);
    setSuggesting(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSearch({ q: "", limit: PAGE_SIZE, offset: 0 })
      .then((res) => {
        if (cancelled) return;
        setApis(res.apis);
        setMeta(res);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!meta?.next_offset || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetchSearch({ q: "", limit: PAGE_SIZE, offset: meta.next_offset });
      setApis((prev) => [...prev, ...res.apis]);
      setMeta((prev) => ({
        ...prev,
        next_offset: res.next_offset,
        offset: res.offset,
        count: res.count,
        total: res.total,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [meta?.next_offset]);

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

  const stats = meta?.facets;
  const showingIntent = Boolean(submittedQuery.trim());
  const draftChanged = showingIntent && query.trim() !== submittedQuery.trim();
  const hasMore = Boolean(meta?.next_offset);

  useEffect(() => {
    setCatalogue({
      query,
      onQueryChange: setQuery,
      onIntentSubmit: submitIntent,
      intentSubmitting: suggesting,
      intentActive: showingIntent,
    });
    return () => setCatalogue(null);
  }, [query, showingIntent, suggesting, submitIntent, setCatalogue]);

  useEffect(() => {
    if (showingIntent || loading || !hasMore) return undefined;
    const node = loadMoreRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showingIntent, loading, hasMore, loadMore, apis.length]);

  return (
    <div className="container-main container-main--catalogue pt-6">
      <section className="hero-banner mb-8" aria-label="Khazak API">
        <KhanShatyrAnimated className="hero-banner-art" />
        <h1 className="hero-title hero-banner-title">every Kazakhstan API you need</h1>
      </section>

      <section className="stats-metal-strip mb-8 grid grid-cols-2 lg:grid-cols-4">
        <div className="stats-block flex-col items-start justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">APIs</span>
          <span className="stats-big-number">{meta?.catalogueTotal ?? meta?.total ?? "—"}</span>
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
                  placeholder="Describe your app or features — address autocomplete, Kaspi checkout, courier ETA…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search APIs"
                />
                <button
                  type="submit"
                  className="catalogue-intent-submit"
                  disabled={!query.trim() || suggesting}
                  aria-label="Analyze APIs"
                >
                  {suggesting ? "…" : "↵"}
                </button>
              </div>
              <p className="catalogue-intent-hint">
                {draftChanged
                  ? "Press Enter to refresh suggestions"
                  : "Describe your app or list features, then press Enter"}
              </p>
            </form>
          </section>

          {showingIntent ? (
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
            <>
              <ApiGrid apis={apis} />
              <div className="catalogue-load-footer" ref={loadMoreRef}>
                {loadingMore ? (
                  <p className="catalogue-load-status">Loading more APIs…</p>
                ) : hasMore ? (
                  <p className="catalogue-load-status">
                    Showing {apis.length} of {meta?.total ?? apis.length}
                  </p>
                ) : (
                  <p className="catalogue-load-status">All {meta?.total ?? apis.length} APIs loaded</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
