import { Link } from "react-router-dom";
import ApiLogo from "./ApiLogo.jsx";
import { apiDescription, updatedLabel } from "../lib/categoryStyle.js";

function VerifiedBadge() {
  return (
    <svg className="postman-verified" viewBox="0 0 16 16" fill="none" aria-label="Verified">
      <circle cx="8" cy="8" r="8" fill="#0265DC" />
      <path d="M4.5 8.1L6.8 10.4L11.5 5.7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ label, value }) {
  return (
    <span className="postman-stat">
      <span className="postman-stat-label">{label}</span>
      <span className="postman-stat-sep">|</span>
      <span className="postman-stat-value">{value}</span>
    </span>
  );
}

function ApiSearchRow({ api }) {
  const verified = api.tier === "open" && api.copyable;
  const description = apiDescription(api);
  const authLabel = api.auth === "none" ? "No auth" : api.auth === "apiKey" ? "API key" : api.auth;

  return (
    <Link to={`/apis/${api.slug || api.id}`} className="postman-row">
      <ApiLogo api={api} size={36} rounded="square" />

      <div className="postman-row-main">
        <h3 className="postman-row-title">{api.title}</h3>
        {description && <p className="postman-row-desc">{description}</p>}
        <p className="postman-row-meta">
          <span>
            By {api.provider}
            {verified && <VerifiedBadge />}
          </span>
          <span className="postman-row-dot" aria-hidden="true">
            ·
          </span>
          <span>{api.category}</span>
          <span className="postman-row-dot" aria-hidden="true">
            ·
          </span>
          <span>{updatedLabel(api.freshness)}</span>
          {api.source && (
            <>
              <span className="postman-row-dot" aria-hidden="true">
                ·
              </span>
              <span>{api.source}</span>
            </>
          )}
        </p>
      </div>

      <div className="postman-row-stats">
        <Stat label="Auth" value={authLabel} />
        <Stat label={api.pricing === "free" ? "Free" : "Paid"} value={api.tier || "open"} />
      </div>
    </Link>
  );
}

export default function ApiSearchList({ apis, query, total }) {
  if (!apis?.length) {
    return (
      <div className="postman-results postman-results-empty">
        <p>No APIs found for &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="postman-results">
      <p className="postman-results-head">
        {total?.toLocaleString() ?? apis.length} result{(total ?? apis.length) === 1 ? "" : "s"} for &ldquo;{query}
        &rdquo;
      </p>
      <div className="postman-list">
        {apis.map((api) => (
          <ApiSearchRow key={api.id} api={api} />
        ))}
      </div>
    </div>
  );
}
