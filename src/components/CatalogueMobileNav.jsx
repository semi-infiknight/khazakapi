import { useEffect } from "react";
import CategorySidebar from "./CategorySidebar.jsx";

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

  useEffect(() => {
    if (!openPanel) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onPanelChange(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("catalogue-mobile-sheet-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("catalogue-mobile-sheet-open");
    };
  }, [openPanel, onPanelChange]);

  return (
    <div className="catalogue-mobile-nav" aria-hidden={false}>
      {openPanel && (
        <div className="catalogue-mobile-sheet" role="presentation">
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
            aria-label={openPanel === "search" ? "Search APIs" : "Browse and filter APIs"}
          >
            <div className="catalogue-mobile-panel-head">
              <h2 className="catalogue-mobile-panel-title">
                {openPanel === "search" ? "Search" : "Browse & filter"}
              </h2>
              <button type="button" className="catalogue-mobile-close" onClick={() => onPanelChange(null)}>
                Done
              </button>
            </div>

            <div className="catalogue-mobile-panel-body">
              {openPanel === "search" ? (
                <div className="relative">
                  <input
                    className="search-input"
                    type="search"
                    placeholder="Search APIs — weather, KATO, Kaspi, 2GIS, NBK rates…"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    aria-label="Search APIs"
                    autoFocus
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

      <nav className="catalogue-mobile-bar stats-metal-strip" aria-label="Catalogue">
        <button
          type="button"
          className={`catalogue-mobile-bar-btn ${openPanel === "search" ? "catalogue-mobile-bar-btn-active" : ""}`}
          aria-expanded={openPanel === "search"}
          onClick={() => onPanelChange(openPanel === "search" ? null : "search")}
        >
          <span className="catalogue-mobile-bar-icon" aria-hidden="true">
            ⌕
          </span>
          <span>Search</span>
        </button>
        <button
          type="button"
          className={`catalogue-mobile-bar-btn ${openPanel === "filters" ? "catalogue-mobile-bar-btn-active" : ""}`}
          aria-expanded={openPanel === "filters"}
          onClick={() => onPanelChange(openPanel === "filters" ? null : "filters")}
        >
          <span className="catalogue-mobile-bar-icon" aria-hidden="true">
            ☰
          </span>
          <span>Categories</span>
          {activeFilterCount > 0 && (
            <span className="catalogue-mobile-bar-badge">{activeFilterCount}</span>
          )}
        </button>
      </nav>
    </div>
  );
}
