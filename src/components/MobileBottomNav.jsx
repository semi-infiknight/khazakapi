import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import CategorySidebar from "./CategorySidebar.jsx";
import { SearchIntentForm } from "./IntentSuggest.jsx";
import SiteNavPanel from "./SiteNavPanel.jsx";
import { useCatalogueNav } from "../context/CatalogueNavContext.jsx";

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

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M5 7h14M5 12h14M5 17h14" />
      </svg>
    );
  }

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
      <rect x="5" y="5" width="5.5" height="5.5" rx="1.2" />
      <rect x="13.5" y="5" width="5.5" height="5.5" rx="1.2" />
      <rect x="5" y="13.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="5.5" height="5.5" rx="1.2" />
    </svg>
  );
}

export default function MobileBottomNav() {
  const { catalogue } = useCatalogueNav();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [openPanel, setOpenPanel] = useState(null);
  const [renderedPanel, setRenderedPanel] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const activeFilterCount = catalogue
    ? [catalogue.filters.category, catalogue.filters.auth, catalogue.filters.pricing, catalogue.filters.tier].filter(
        Boolean,
      ).length
    : 0;

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
        document.documentElement.style.setProperty("--viewport-offset-top", "0px");
        return;
      }

      const chrome = Math.max(0, window.innerHeight - viewport.offsetTop - viewport.height);
      const capped = Math.min(chrome, 120);
      document.documentElement.style.setProperty("--browser-ui-offset", `${capped}px`);
      document.documentElement.style.setProperty("--viewport-offset-top", `${viewport.offsetTop}px`);
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
      document.documentElement.style.removeProperty("--viewport-offset-top");
    };
  }, []);

  useEffect(() => {
    const requested = location.state?.openPanel;
    if (!requested || location.pathname !== "/") return;
    setOpenPanel(requested);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

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
      if (e.key === "Escape") setOpenPanel(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("catalogue-mobile-sheet-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("catalogue-mobile-sheet-open");
    };
  }, [renderedPanel]);

  useEffect(() => {
    if (renderedPanel !== "search") return undefined;
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [renderedPanel]);

  const closePanel = () => setOpenPanel(null);

  const openCataloguePanel = (panel) => {
    if (catalogue) {
      setOpenPanel(openPanel === panel ? null : panel);
      return;
    }
    navigate("/", { state: { openPanel: panel } });
  };

  const panelTitle =
    renderedPanel === "filters" ? "Browse & filter" : renderedPanel === "search" ? "What are you building?" : "Menu";
  const panelLabel =
    renderedPanel === "filters"
      ? "Browse and filter APIs"
      : renderedPanel === "search"
        ? "Describe what you are building"
        : "Site navigation";

  const nav = (
    <div className="catalogue-mobile-nav" aria-hidden={false}>
      {renderedPanel && (
        <div
          className={`catalogue-mobile-sheet ${sheetVisible ? "catalogue-mobile-sheet-visible" : "catalogue-mobile-sheet-closing"}`}
          role="presentation"
        >
          <button type="button" className="catalogue-mobile-backdrop" aria-label="Close panel" onClick={closePanel} />
          <div className="catalogue-mobile-panel panel" role="dialog" aria-modal="true" aria-label={panelLabel}>
            <div className="catalogue-mobile-panel-head">
              <h2 className="catalogue-mobile-panel-title">{panelTitle}</h2>
              <button type="button" className="catalogue-mobile-close" onClick={closePanel}>
                Done
              </button>
            </div>

            <div className="catalogue-mobile-panel-body">
              {renderedPanel === "search" && catalogue ? (
                <SearchIntentForm
                  compact
                  inputRef={searchInputRef}
                  value={catalogue.query || ""}
                  onChange={catalogue.onQueryChange}
                  loading={catalogue.suggesting}
                  active={catalogue.suggestionActive}
                  onClear={() => {
                    catalogue.onClearSuggest?.();
                    closePanel();
                  }}
                  onSubmit={(text) => {
                    catalogue.onIntentSubmit?.(text);
                    closePanel();
                  }}
                />
              ) : renderedPanel === "filters" && catalogue ? (
                <CategorySidebar
                  className="catalogue-sidebar catalogue-sidebar--sheet"
                  facets={catalogue.facets}
                  total={catalogue.total}
                  filteredTotal={catalogue.filteredTotal}
                  filters={catalogue.filters}
                  onFilterChange={(key, value) => {
                    catalogue.onFilterChange(key, value);
                    if (key === "category") closePanel();
                  }}
                  catalogCategories={catalogue.catalogCategories}
                />
              ) : (
                <SiteNavPanel onNavigate={closePanel} />
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="catalogue-mobile-bar" aria-label="Mobile navigation">
        <button
          type="button"
          className={`catalogue-mobile-bar-btn catalogue-mobile-bar-btn-side ${openPanel === "menu" ? "catalogue-mobile-bar-btn-active" : ""}`}
          aria-expanded={openPanel === "menu"}
          aria-label="Open site menu"
          onClick={() => openCataloguePanel("menu")}
        >
          <span className="catalogue-mobile-bar-icon">
            <DockIcon name="menu" />
          </span>
        </button>

        <button
          type="button"
          className={`catalogue-mobile-bar-btn catalogue-mobile-search-trigger ${openPanel === "search" ? "catalogue-mobile-bar-btn-active" : ""}`}
          aria-expanded={openPanel === "search"}
          aria-label="Describe what you're building"
          onClick={() => openCataloguePanel("search")}
        >
          <span className="catalogue-mobile-bar-icon">
            <DockIcon name="search" />
          </span>
        </button>

        <button
          type="button"
          className={`catalogue-mobile-bar-btn catalogue-mobile-bar-btn-side ${openPanel === "filters" ? "catalogue-mobile-bar-btn-active" : ""}`}
          aria-expanded={openPanel === "filters"}
          aria-label="Browse categories and filters"
          onClick={() => openCataloguePanel("filters")}
        >
          <span className="catalogue-mobile-bar-icon">
            <DockIcon name="browse" />
          </span>
          {activeFilterCount > 0 && <span className="catalogue-mobile-bar-badge">{activeFilterCount}</span>}
        </button>
      </nav>
    </div>
  );

  return createPortal(nav, document.body);
}
