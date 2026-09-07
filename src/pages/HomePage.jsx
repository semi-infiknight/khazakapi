import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSearch, fetchSuggest } from "../lib/api.js";
import ApiGrid, { SKELETON_COUNT } from "../components/ApiGrid.jsx";
import DotMatrixLoader from "../components/DotMatrixLoader.jsx";
import { IntentResults } from "../components/IntentSuggest.jsx";
import IntentInputBar from "../components/IntentInputBar.jsx";
import KhazakArchFigure from "../components/KhazakArchFigure.jsx";
import { INTENT_PROMPT_HINTS } from "../data/intentPromptHints.js";
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
  const [generatingStack, setGeneratingStack] = useState(false);
  const [apis, setApis] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [staggerFrom, setStaggerFrom] = useState(0);
  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const nextOffsetRef = useRef(null);

  const clearIntent = useCallback(() => {
    setSubmittedQuery("");
    setSuggestion(null);
    setSuggesting(false);
    setGeneratingStack(false);
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
    // Pause scroll-driven loads until the new page settles.
    document.body.classList.add("catalogue-loading-more");
    try {
      const res = await fetchSearch({ q: "", limit: PAGE_SIZE, offset });
      nextOffsetRef.current = res.next_offset;
      setApis((prev) => {
        setStaggerFrom(prev.length);
        return [...prev, ...res.apis];
      });
      setMeta((prev) => ({
        ...prev,
        next_offset: res.next_offset,
        offset: res.offset,
        count: res.count,
        total: res.total,
      }));
      // Let the staggered card-enter animation breathe before unblocking.
      await new Promise((r) => setTimeout(r, 520));
      return res.next_offset;
    } catch (err) {
      console.error(err);
      return nextOffsetRef.current;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
      document.body.classList.remove("catalogue-loading-more");
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
    setGeneratingStack(false);

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
  const hasMore = Boolean(meta?.next_offset);
  // Hero caption: KZ-filtered baseline only. Legacy servers returned unfiltered total (1407).
  const catalogueTotal = meta?.catalogueTotal ?? 688;
  const resultsTotal = meta?.total ?? catalogueTotal;
  const contentKey = showingIntent ? "intent" : loading ? "loading" : "grid";

  useEffect(() => {
    setCatalogue({
      query,
      onQueryChange: setQuery,
      onIntentSubmit: submitIntent,
      intentSubmitting: suggesting || generatingStack,
      intentActive: showingIntent,
    });
    return () => setCatalogue(null);
  }, [query, showingIntent, suggesting, generatingStack, submitIntent, setCatalogue]);

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
    <div className="container-main container-main--catalogue">
      <section className="hero-arch" aria-label="Qazaq Stack">
        <div className="hero-arch-stack">
          <KhazakArchFigure catalogueTotal={catalogueTotal} />
        </div>
      </section>

      <div className="catalogue-layout">
        <div className="catalogue-main">
          <section className="catalogue-search-desktop mb-6">
            <IntentInputBar
              variant="hero"
              value={query}
              onChange={setQuery}
              onSubmit={submitIntent}
              submitting={suggesting || generatingStack}
              hintLines={INTENT_PROMPT_HINTS}
            />
          </section>

          {showingIntent ? (
            <div id="intent-results" className="catalogue-content-enter" key={contentKey}>
              {suggesting && !suggestion ? (
                <div className="catalogue-loader-wrap">
                  <DotMatrixLoader size={120} dotSize={9} label="Finding APIs…" />
                </div>
              ) : (
                <IntentResults suggestion={suggestion} onGeneratingChange={setGeneratingStack} />
              )}
            </div>
          ) : loading ? (
            <div className="catalogue-loader-wrap" key={contentKey}>
              <DotMatrixLoader size={132} dotSize={10} label="Loading catalogue…" />
            </div>
          ) : (
            <div className="catalogue-content-enter" key={contentKey}>
              <ApiGrid apis={apis} stagger staggerFrom={staggerFrom} />
              {loadingMore ? (
                <div className="catalogue-load-footer">
                  <ApiGrid skeleton={SKELETON_COUNT} />
                </div>
              ) : null}
              <div className="catalogue-load-footer" ref={loadMoreRef}>
                {loadingMore ? null : hasMore ? (
                  <>
                    <p className="catalogue-load-status">
                      Showing {apis.length} of {resultsTotal} — keep scrolling or load more
                    </p>
                    <button type="button" className="catalogue-load-btn" onClick={loadMoreIfNeeded}>
                      Load more APIs
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
