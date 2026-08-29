import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ApiLogo from "./ApiLogo.jsx";
import { fetchSuggest } from "../lib/api.js";

const FALLBACK_EXAMPLES = [
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
          <a
            href={api.plugIn.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="intent-api-docs"
          >
            Docs ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function IntentSuggest({
  value,
  onChange,
  onResults,
  onClear,
  active = false,
  className = "",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [examples, setExamples] = useState(FALLBACK_EXAMPLES);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchSuggest("")
      .then((res) => {
        if (res.examples?.length) setExamples(res.examples);
      })
      .catch(() => {});
  }, []);

  const runSuggest = async (text = value) => {
    const q = text.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSuggest(q);
      if (res.examples?.length) setExamples(res.examples);
      onResults?.(res);
    } catch (err) {
      setError(err.message || "Could not suggest APIs");
    } finally {
      setLoading(false);
    }
  };

  const applyExample = (example) => {
    onChange?.(example);
    runSuggest(example);
  };

  return (
    <section className={`intent-suggest ${className}`.trim()} aria-label="Describe what you need APIs for">
      <div className="intent-suggest-head">
        <p className="intent-suggest-eyebrow">Main CTA</p>
        <h2 className="intent-suggest-title">Describe what you&rsquo;re building</h2>
        <p className="intent-suggest-sub">
          We&rsquo;ll suggest the Kazakhstan APIs that fit — and where each one plugs into your product.
        </p>
      </div>

      <form
        className="intent-suggest-form"
        onSubmit={(e) => {
          e.preventDefault();
          runSuggest();
        }}
      >
        <textarea
          ref={inputRef}
          className="intent-suggest-input"
          rows={3}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="e.g. Food delivery app in Almaty — Kaspi checkout, courier ETAs, and address autocomplete…"
          aria-label="Describe the product you are building"
        />
        <div className="intent-suggest-actions">
          <button type="submit" className="btn-metal intent-suggest-submit" disabled={loading || !value.trim()}>
            {loading ? "Finding APIs…" : "Suggest APIs"}
          </button>
          {active && (
            <button
              type="button"
              className="intent-suggest-clear"
              onClick={() => {
                onChange?.("");
                onClear?.();
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <div className="intent-suggest-examples" aria-label="Example product ideas">
        {examples.slice(0, 4).map((example) => (
          <button key={example} type="button" className="intent-chip" onClick={() => applyExample(example)}>
            {example}
          </button>
        ))}
      </div>

      {error && <p className="intent-suggest-error">{error}</p>}
    </section>
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
