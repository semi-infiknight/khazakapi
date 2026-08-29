import { Link } from "react-router-dom";
import ApiLogo from "./ApiLogo.jsx";

const EXAMPLES = [
  "Food delivery app for Almaty with Kaspi pay and courier ETAs",
  "Fintech wallet that shows NBK rates and accepts FreedomPay",
  "Marketplace for local sellers with maps and address autocomplete",
  "Travel planner with flights, trains, and hotel maps in Astana",
];

function PlugInCard({ api }) {
  const href = api.plugIn?.href || api.hubPath || `/apis/${api.slug || api.id}`;
  const steps = api.plugIn?.steps || [];

  return (
    <article className="intent-api-card">
      <div className="intent-api-card-top">
        <ApiLogo api={api} size={40} />
        <div className="intent-api-card-copy">
          <h4 className="intent-api-title">
            <Link to={href}>{api.title}</Link>
          </h4>
          <p className="intent-api-role">{api.role || api.category}</p>
        </div>
      </div>

      {api.plugIn?.where && (
        <p className="intent-api-where">
          <span className="intent-api-where-label">Where it plugs in</span>
          {api.plugIn.where}
        </p>
      )}

      {steps.length > 0 && (
        <ol className="intent-api-steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}

      <div className="intent-api-actions">
        <Link to={href} className="btn-metal intent-api-cta">
          Open & try
        </Link>
        {api.plugIn?.docs && (
          <a href={api.plugIn.docs} target="_blank" rel="noopener noreferrer" className="intent-api-docs">
            Docs ↗
          </a>
        )}
      </div>
    </article>
  );
}

/** Compact composer for the search bar / search sheet — not a standalone page section. */
export function SearchIntentForm({
  value,
  onChange,
  onSubmit,
  onClear,
  loading = false,
  active = false,
  inputRef,
  compact = false,
}) {
  return (
    <form
      className={`search-intent-form ${compact ? "search-intent-form--compact" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <textarea
        ref={inputRef}
        className="search-intent-input"
        rows={compact ? 4 : 3}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit?.(value);
          }
        }}
        placeholder="Describe what you're building — e.g. food delivery with Kaspi pay and maps…"
        aria-label="Describe what you're building"
      />
      <div className="search-intent-actions">
        <button type="submit" className="btn-metal search-intent-submit" disabled={loading || !value.trim()}>
          {loading ? "Finding APIs…" : "Suggest APIs"}
        </button>
        {active && (
          <button
            type="button"
            className="search-intent-clear"
            onClick={() => {
              onChange?.("");
              onClear?.();
            }}
          >
            Clear
          </button>
        )}
      </div>
      <div className="search-intent-examples" aria-label="Example product ideas">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="intent-chip"
            onClick={() => {
              onChange?.(example);
              onSubmit?.(example);
            }}
          >
            {example}
          </button>
        ))}
      </div>
    </form>
  );
}

export function IntentResults({ suggestion }) {
  if (!suggestion?.intents?.length && !suggestion?.apis?.length) {
    if (!suggestion?.query) return null;
    return (
      <div className="panel intent-results intent-results--empty">
        <p className="font-mono text-sm text-[var(--text-soft)]">
          No APIs matched &ldquo;{suggestion.query}&rdquo;. Try naming payments, maps, delivery, or government data.
        </p>
      </div>
    );
  }

  return (
    <div className="intent-results">
      <div className="intent-results-summary panel">
        <p className="intent-results-summary-text">{suggestion.summary}</p>
        <p className="intent-results-summary-meta">
          {suggestion.total} API{suggestion.total === 1 ? "" : "s"} · {suggestion.intents.length} stack layer
          {suggestion.intents.length === 1 ? "" : "s"}
        </p>
      </div>

      {suggestion.intents.map((block) => (
        <section key={block.id} className="intent-layer">
          <header className="intent-layer-head">
            <h3 className="intent-layer-title">{block.label}</h3>
            <p className="intent-layer-where">{block.where}</p>
          </header>
          <div className="intent-layer-grid">
            {block.apis.map((api) => (
              <PlugInCard key={`${block.id}-${api.id}`} api={api} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
