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

export default function CategorySidebar({ facets, total, filters, onFilterChange }) {
  const { category, auth, pricing } = filters;
  const categories = Object.entries(facets?.category || {}).sort((a, b) => b[1] - a[1]);
  const authOptions = Object.entries(facets?.auth || {}).sort((a, b) => b[1] - a[1]);
  const pricingOptions = Object.entries(facets?.pricing || {}).sort((a, b) => b[1] - a[1]);

  const hasFilters = category || auth || pricing;

  const clearAll = () => {
    onFilterChange("category", "");
    onFilterChange("auth", "");
    onFilterChange("pricing", "");
  };

  return (
    <aside className="panel catalogue-sidebar">
      <SidebarSection title="Discovery">
        <button
          type="button"
          className={`catalogue-sidebar-link ${!hasFilters ? "catalogue-sidebar-link-active" : ""}`}
          onClick={clearAll}
        >
          <span>All KZ APIs</span>
          {total != null && <span className="catalogue-sidebar-count">{total}</span>}
        </button>
      </SidebarSection>

      <SidebarSection title="Categories">
        <div className="catalogue-sidebar-scroll">
          <SidebarNav
            items={categories}
            active={category}
            onSelect={(value) => onFilterChange("category", value)}
          />
        </div>
      </SidebarSection>

      <SidebarSection title="Auth">
        <SidebarNav items={authOptions} active={auth} onSelect={(value) => onFilterChange("auth", value)} />
      </SidebarSection>

      <SidebarSection title="Pricing">
        <SidebarNav items={pricingOptions} active={pricing} onSelect={(value) => onFilterChange("pricing", value)} />
      </SidebarSection>

      {hasFilters && (
        <button type="button" className="catalogue-sidebar-clear" onClick={clearAll}>
          Clear all filters
        </button>
      )}
    </aside>
  );
}
