export default function CategorySidebar({ facets, active, onChange, total }) {
  const categories = Object.entries(facets?.category || {}).sort((a, b) => b[1] - a[1]);
  const visible = categories.slice(0, 12);
  const hasMore = categories.length > visible.length;

  return (
    <aside className="hub-sidebar">
      <div className="hub-sidebar-section">
        <h2 className="hub-sidebar-heading">Discovery</h2>
        <button
          type="button"
          className={`hub-sidebar-link ${!active ? "hub-sidebar-link-active" : ""}`}
          onClick={() => onChange("")}
        >
          All APIs
          {total != null && <span className="hub-sidebar-count">{total}</span>}
        </button>
      </div>

      <div className="hub-sidebar-section">
        <h2 className="hub-sidebar-heading">Categories</h2>
        <nav className="hub-sidebar-nav" aria-label="Categories">
          {visible.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className={`hub-sidebar-link ${active === name ? "hub-sidebar-link-active" : ""}`}
              onClick={() => onChange(active === name ? "" : name)}
            >
              <span className="hub-sidebar-link-text">{name}</span>
              <span className="hub-sidebar-count">{count}</span>
            </button>
          ))}
        </nav>

        {hasMore && !active && (
          <p className="hub-sidebar-footnote">{categories.length} categories in catalogue</p>
        )}

        {active && (
          <button type="button" className="hub-sidebar-view-all" onClick={() => onChange("")}>
            <span className="hub-sidebar-view-icon" aria-hidden="true">
              ☰
            </span>
            View all categories
          </button>
        )}
      </div>
    </aside>
  );
}
