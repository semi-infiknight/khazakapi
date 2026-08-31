import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSearch, fetchSuggest } from "../lib/api.js";
import ApiGrid from "../components/ApiGrid.jsx";
import { IntentResults } from "../components/IntentSuggest.jsx";
import KhazakArchFigure from "../components/KhazakArchFigure.jsx";
import { useCatalogueNav } from "../context/CatalogueNavContext.jsx";

const PAGE_SIZE = 24;
const LOAD_ROOT_MARGIN = "480px 0px";

function sentinelInView(node) {
  if (!node) return false;
  const rect = node.getBoundingClientRect();
  return rect.top <= window.innerHeight + 480;
}

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
  const nextOffsetRef = useRef(null);

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
        nextOffsetRef.current = res.next_offset;
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
    const offset = nextOffsetRef.current;
    if (offset == null || loadingMoreRef.current) return null;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetchSearch({ q: "", limit: PAGE_SIZE, offset });
      nextOffsetRef.current = res.next_offset;
      setApis((prev) => [...prev, ...res.apis]);
      setMeta((prev) => ({
        ...prev,
        next_offset: res.next_offset,
        offset: res.offset,
        count: res.count,
        total: res.total,
      }));
      return res.next_offset;
    } catch (err) {
      console.error(err);
      return nextOffsetRef.current;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  const loadMoreIfNeeded = useCallback(async () => {
    let next = await loadMore();
    let chained = 0;
    while (next != null && chained < 2 && sentinelInView(loadMoreRef.current)) {
      next = await loadMore();
      chained += 1;
    }
  }, [loadMore]);

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

  const showingIntent = Boolean(submittedQuery.trim());
  const draftChanged = showingIntent && query.trim() !== submittedQuery.trim();
  const hasMore = Boolean(meta?.next_offset);
  // Hero caption: KZ-filtered baseline only. Legacy servers returned unfiltered total (1407).
  const catalogueTotal = meta?.catalogueTotal ?? 688;
  const resultsTotal = meta?.total ?? catalogueTotal;

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
        if (entries.some((entry) => entry.isIntersecting)) loadMoreIfNeeded();
      },
      { rootMargin: LOAD_ROOT_MARGIN },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showingIntent, loading, hasMore, loadMoreIfNeeded, apis.length]);

  useEffect(() => {
    if (showingIntent || loading || !hasMore || loadingMore) return undefined;
    if (!sentinelInView(loadMoreRef.current)) return undefined;
    loadMoreIfNeeded();
  }, [showingIntent, loading, hasMore, loadingMore, apis.length, loadMoreIfNeeded]);

  return (
    <div className="container-main container-main--catalogue pt-6">
      <section className="hero-arch" aria-label="Khazak API">
        <h1 className="hero-title hero-arch-title">every Kazakhstan API you need</h1>
        <div className="hero-arch-stack">
          <KhazakArchFigure catalogueTotal={catalogueTotal} />
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
                  <>
                    <p className="catalogue-load-status">
                      Showing {apis.length} of {resultsTotal} — keep scrolling or load more
                    </p>
                    <button type="button" className="catalogue-load-btn" onClick={loadMoreIfNeeded}>
                      Load more APIs
                    </button>
                  </>
                ) : (
                  <p className="catalogue-load-status catalogue-load-status--done">
                    All {resultsTotal} APIs loaded
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
