const FLAGS = {
  KZ: "🇰🇿",
  global: "🌐",
  US: "🇺🇸",
  EU: "🇪🇺",
};

export function CountryFilter({ facets, active, onChange }) {
  const countries = Object.entries(facets?.country || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flag-marquee mt-3">
      <div className="flag-track">
        {[...countries, ...countries].map(([code, count], i) => (
          <button
            key={`${code}-${i}`}
            type="button"
            className={`flag-chip ${active === code ? "on" : ""}`}
            onClick={() => onChange(active === code ? "" : code)}
          >
            <span>{FLAGS[code] || code}</span>
            <span>{code}</span>
            <span className="flag-count">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FacetChips({ label, items, active, onChange }) {
  const entries = Object.entries(items || {}).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (!entries.length) return null;

  return (
    <div className="hub-filter-group">
      <p className="hub-filter-label">{label}</p>
      <div className="hub-filter-chips">
        {entries.map(([key, count]) => (
          <button
            key={key}
            type="button"
            className={`hub-filter-chip ${active === key ? "hub-filter-chip-active" : ""}`}
            onClick={() => onChange(active === key ? "" : key)}
          >
            {key}
            <span className="hub-filter-count">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
