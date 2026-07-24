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
    <div className="mt-3">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, count]) => (
          <button
            key={key}
            type="button"
            className={`chip ${active === key ? "on" : ""}`}
            onClick={() => onChange(active === key ? "" : key)}
          >
            {key}
            <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
