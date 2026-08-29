import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CategorySidebar from "./CategorySidebar.jsx";

function DockIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 4 4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 7h14M5 12h14M5 17h14" />
      <circle cx="8" cy="7" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="10" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export default function CatalogueMobileNav({
  openPanel,
  onPanelChange,
  query,
  onQueryChange,
  facets,
  total,
  filteredTotal,
  filters,
  onFilterChange,
  catalogCategories,
}) {
  const { auth, pricing, tier } = filters;
  const activeFilterCount = [auth, pricing, tier].filter(Boolean).length;
  const [renderedPanel, setRenderedPanel] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    document.body.classList.add("catalogue-mobile-nav-active");
    return () => {
      document.body.classList.remove("catalogue-mobile-nav-active");
    };
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const syncBrowserChrome = () => {
      if (!viewport.height) {
        document.documentElement.style.setProperty("--browser-ui-offset", "0px");
        return;
      }

      const chrome = Math.max(0, window.innerHeight - viewport.offsetTop - viewport.height);
      const capped = Math.min(chrome, 120);
      document.documentElement.style.setProperty("--browser-ui-offset", `${capped}px`);
    };

    syncBrowserChrome();
    viewport.addEventListener("resize", syncBrowserChrome);
    viewport.addEventListener("scroll", syncBrowserChrome);
    window.addEventListener("orientationchange", syncBrowserChrome);

    return () => {
      viewport.removeEventListener("resize", syncBrowserChrome);
      viewport.removeEventListener("scroll", syncBrowserChrome);
      window.removeEventListener("orientationchange", syncBrowserChrome);
      document.documentElement.style.removeProperty("--browser-ui-offset");
    };
  }, []);

  useEffect(() => {
    if (openPanel) {
      setRenderedPanel(openPanel);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setSheetVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setSheetVisible(false);
    const timer = window.setTimeout(() => setRenderedPanel(null), 320);
    return () => window.clearTimeout(timer);
  }, [openPanel]);

  useEffect(() => {
    if (!renderedPanel) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onPanelChange(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("catalogue-mobile-sheet-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("catalogue-mobile-sheet-open");
    };
  }, [renderedPanel, onPanelChange]);

  const togglePanel = (panel) => {
    onPanelChange(openPanel === panel ? null : panel);
  };

  const nav = (
    <div className="catalogue-mobile-nav" aria-hidden={false}>
      {renderedPanel && (
        <div
          className={`catalogue-mobile-sheet ${sheetVisible ? "catalogue-mobile-sheet-visible" : "catalogue-mobile-sheet-closing"}`}
          role="presentation"
        >
          <button
            type="button"
            className="catalogue-mobile-backdrop"
            aria-label="Close panel"
            onClick={() => onPanelChange(null)}
          />
          <div
            className="catalogue-mobile-panel panel"
            role="dialog"
            aria-modal="true"
            aria-label={renderedPanel === "search" ? "Search APIs" : "Browse and filter APIs"}
          >
            <div className="catalogue-mobile-panel-head">
              <h2 className="catalogue-mobile-panel-title">
                {renderedPanel === "search" ? "Search" : "Browse & filter"}
              </h2>
              <button type="button" className="catalogue-mobile-close" onClick={() => onPanelChange(null)}>
                Done
              </button>
            </div>

            <div className="catalogue-mobile-panel-body">
              {renderedPanel === "search" ? (
                <div className="relative">
                  <input
                    className="search-input"
                    type="search"
                    placeholder="Search APIs — weather, KATO, Kaspi, 2GIS, NBK rates…"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    aria-label="Search APIs"
                    autoFocus={sheetVisible}
                  />
                </div>
              ) : (
                <CategorySidebar
                  className="catalogue-sidebar catalogue-sidebar--sheet"
                  facets={facets}
                  total={total}
                  filteredTotal={filteredTotal}
                  filters={filters}
                  onFilterChange={onFilterChange}
                  catalogCategories={catalogCategories}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="catalogue-mobile-bar" aria-label="Catalogue">
        <button
          type="button"
          className={`catalogue-mobile-bar-btn ${openPanel === "search" ? "catalogue-mobile-bar-btn-active" : ""}`}
          aria-expanded={openPanel === "search"}
          aria-label="Search APIs"
          onClick={() => togglePanel("search")}
        >
          <span className="catalogue-mobile-bar-icon">
            <DockIcon name="search" />
          </span>
        </button>
        <button
          type="button"
          className={`catalogue-mobile-bar-btn ${openPanel === "filters" ? "catalogue-mobile-bar-btn-active" : ""}`}
          aria-expanded={openPanel === "filters"}
          aria-label="Browse categories and filters"
          onClick={() => togglePanel("filters")}
        >
          <span className="catalogue-mobile-bar-icon">
            <DockIcon name="browse" />
          </span>
          {activeFilterCount > 0 && (
            <span className="catalogue-mobile-bar-badge">{activeFilterCount}</span>
          )}
        </button>
      </nav>
    </div>
  );

  return createPortal(nav, document.body);
}
