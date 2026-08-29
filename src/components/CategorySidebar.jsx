import { categoryLabel } from "../lib/categoryStyle.js";

function SidebarSection({ title, children }) {
  return (
    <div className="catalogue-sidebar-section">
      <h2 className="catalogue-sidebar-heading">{title}</h2>
      {children}
    </div>
  );
}

function SidebarNav({ items, active, onSelect, formatLabel }) {
  if (!items.length) return null;
  return (
    <nav className="catalogue-sidebar-nav">
      {items.map(([key, count]) => (
        <button
          key={key}
          type="button"
          className={`catalogue-sidebar-link ${active === key ? "catalogue-sidebar-link-active" : ""}`}
          onClick={() => onSelect(active === key ? "" : key)}
        >
          <span className="catalogue-sidebar-link-text">{formatLabel ? formatLabel(key) : key}</span>
          <span className="catalogue-sidebar-count">{count}</span>
        </button>
      ))}
    </nav>
  );
}

const PRICING_LABELS = {
  free: "Free (open data & free tiers)",
  freemium: "Freemium",
  paid: "Paid",
};

const TIER_LABELS = {
  open: "Open / government",
  commercial: "Commercial only",
};

export default function CategorySidebar({
  facets,
  total,
  filteredTotal,
  filters,
  onFilterChange,
  catalogCategories,
  className = "",
}) {
  const { category, auth, pricing, tier } = filters;
  const authOptions = Object.entries(facets?.auth || {}).sort((a, b) => b[1] - a[1]);
  const pricingOptions = Object.entries(facets?.pricing || {})
    .filter(([key]) => key === "paid" || key === "freemium")
    .sort((a, b) => b[1] - a[1]);
  const tierOptions = Object.entries(facets?.tier || {})
    .filter(([key]) => key === "commercial")
    .sort((a, b) => b[1] - a[1]);

  const hasFilters = category || auth || pricing || tier;

  const clearAll = () => {
    onFilterChange("category", "");
    onFilterChange("auth", "");
    onFilterChange("pricing", "");
    onFilterChange("tier", "");
  };

  return (
    <aside className={`panel catalogue-sidebar ${className}`.trim()}>
      <SidebarSection title="Discovery">
        <button
          type="button"
          className={`catalogue-sidebar-link ${!hasFilters ? "catalogue-sidebar-link-active" : ""}`}
          onClick={clearAll}
        >
          <span>All KZ APIs</span>
          {total != null && <span className="catalogue-sidebar-count">{total}</span>}
        </button>
        {hasFilters && filteredTotal != null && (
          <p className="catalogue-sidebar-hint">{filteredTotal} matching current filters</p>
        )}
      </SidebarSection>

      <SidebarSection title="Filter by category">
        <p className="catalogue-sidebar-hint mb-2">Narrow the catalogue without leaving this page</p>
        <div className="catalogue-sidebar-scroll">
          <nav className="catalogue-sidebar-nav">
            {(catalogCategories || []).map((cat) => (
              <button
                key={cat.slug}
                type="button"
                className={`catalogue-sidebar-link ${category === cat.name ? "catalogue-sidebar-link-active" : ""}`}
                onClick={() => onFilterChange("category", category === cat.name ? "" : cat.name)}
              >
                <span className="catalogue-sidebar-link-text">{categoryLabel(cat.name)}</span>
                <span className="catalogue-sidebar-count">{cat.count}</span>
              </button>
            ))}
          </nav>
        </div>
      </SidebarSection>

      <SidebarSection title="Commercial & pricing">
        <p className="catalogue-sidebar-hint mb-2">
          Provider billing — test any of these here once you have an API key.
        </p>
        <SidebarNav
          items={tierOptions}
          active={tier}
          onSelect={(value) => onFilterChange("tier", value)}
          formatLabel={(key) => TIER_LABELS[key] || key}
        />
        <SidebarNav
          items={pricingOptions}
          active={pricing}
          onSelect={(value) => onFilterChange("pricing", value)}
          formatLabel={(key) => PRICING_LABELS[key] || key}
        />
      </SidebarSection>

      <SidebarSection title="Auth">
        <SidebarNav items={authOptions} active={auth} onSelect={(value) => onFilterChange("auth", value)} />
      </SidebarSection>

      {hasFilters && (
        <button type="button" className="catalogue-sidebar-clear" onClick={clearAll}>
          Clear all filters
        </button>
      )}
    </aside>
  );
}
