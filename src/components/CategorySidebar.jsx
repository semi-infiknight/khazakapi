export default function CategorySidebar({ facets, active, onChange, total }) {
  const categories = Object.entries(facets?.category || {}).sort((a, b) => b[1] - a[1]);
  const visible = categories.slice(0, 14);

  return (
    <aside className="panel catalogue-sidebar">
      <div className="catalogue-sidebar-section">
        <h2 className="catalogue-sidebar-heading">Discovery</h2>
        <button
          type="button"
          className={`catalogue-sidebar-link ${!active ? "catalogue-sidebar-link-active" : ""}`}
          onClick={() => onChange("")}
        >
          <span>All APIs</span>
          {total != null && <span className="catalogue-sidebar-count">{total}</span>}
        </button>
      </div>

      <div className="catalogue-sidebar-section">
        <h2 className="catalogue-sidebar-heading">Categories</h2>
        <nav className="catalogue-sidebar-nav" aria-label="Categories">
          {visible.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className={`catalogue-sidebar-link ${active === name ? "catalogue-sidebar-link-active" : ""}`}
              onClick={() => onChange(active === name ? "" : name)}
            >
              <span className="catalogue-sidebar-link-text">{name}</span>
              <span className="catalogue-sidebar-count">{count}</span>
            </button>
          ))}
        </nav>
        {active && (
          <button type="button" className="catalogue-sidebar-clear" onClick={() => onChange("")}>
            Clear category
          </button>
        )}
      </div>
    </aside>
  );
}
