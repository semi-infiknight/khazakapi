import { Link } from "react-router-dom";
import { apiDescription, updatedLabel } from "../lib/categoryStyle.js";

function VerifiedBadge() {
  return (
    <svg className="catalogue-search-verified" viewBox="0 0 16 16" fill="none" aria-label="Verified">
      <circle cx="8" cy="8" r="8" fill="#39d98a" />
      <path d="M4.5 8.1L6.8 10.4L11.5 5.7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ label, value }) {
  return (
    <span className="catalogue-search-stat">
      <span className="catalogue-search-stat-label">{label}</span>
      <span className="catalogue-search-stat-sep">|</span>
      <span>{value}</span>
    </span>
  );
}

function ApiSearchRow({ api }) {
  const verified = api.tier === "open" && api.copyable;
  const description = apiDescription(api);
  const authLabel = api.auth === "none" ? "No auth" : api.auth === "apiKey" ? "API key" : api.auth;
  const href = api.hubPath || (api.companyHub && api.categorySlug && api.companySlug
    ? `/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`
    : `/apis/${api.slug || api.id}`);

  return (
    <Link to={href} className="catalogue-search-row">
      <div className="catalogue-search-row-main">
        <h3 className="catalogue-search-title">
          {api.title}
          {verified && <VerifiedBadge />}
        </h3>
        {description && <p className="catalogue-search-desc">{description}</p>}
        <p className="catalogue-search-meta">
          <span>{api.companyHub ? api.companyName || api.provider : `By ${api.provider}`}</span>
          <span aria-hidden="true">·</span>
          <span>{api.category}</span>
          <span aria-hidden="true">·</span>
          <span>{updatedLabel(api.freshness)}</span>
          {api.source && (
            <>
              <span aria-hidden="true">·</span>
              <span>{api.source}</span>
            </>
          )}
        </p>
      </div>

      <div className="catalogue-search-stats">
        <Stat label="Auth" value={authLabel} />
        <Stat label={api.pricing === "free" ? "Free" : "Paid"} value={api.tier || "open"} />
      </div>
    </Link>
  );
}

export default function ApiSearchList({ apis, query, total }) {
  if (!apis?.length) {
    return (
      <div className="panel catalogue-search-panel catalogue-search-empty">
        <p className="font-mono text-sm text-[var(--text-soft)]">No APIs found for &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="panel catalogue-search-panel">
      <p className="catalogue-search-head">
        {total?.toLocaleString() ?? apis.length} result{(total ?? apis.length) === 1 ? "" : "s"} for &ldquo;{query}
        &rdquo;
      </p>
      <div className="catalogue-search-list">
        {apis.map((api) => (
          <ApiSearchRow key={api.id} api={api} />
        ))}
      </div>
    </div>
  );
}
