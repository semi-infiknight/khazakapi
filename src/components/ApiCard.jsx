import { Link } from "react-router-dom";
import ApiLogo from "./ApiLogo.jsx";
import {
  apiDescription,
  cardMetricAuth,
  cardMetricReady,
  categoryLabel,
  updatedLabel,
} from "../lib/categoryStyle.js";

function MetricPill({ icon, children }) {
  return (
    <span className="api-card-metric">
      <span className="api-card-metric-icon" aria-hidden="true">
        {icon}
      </span>
      {children}
    </span>
  );
}

function VerifiedIcon() {
  return (
    <svg className="api-card-verified" viewBox="0 0 16 16" fill="none" aria-label="Verified">
      <circle cx="8" cy="8" r="8" fill="#39d98a" />
      <path d="M4.5 8.1L6.8 10.4L11.5 5.7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ApiCard({ api }) {
  const verified = api.tier === "open" && api.copyable;
  const description = apiDescription(api);
  const updated = updatedLabel(api.freshness, api.trust?.lastChecked);
  const href = api.hubPath || (api.companyHub && api.categorySlug && api.companySlug
    ? `/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`
    : `/apis/${api.slug || api.id}`);

  return (
    <Link to={href} className="card api-card block">
      <div className="api-card-body">
        <ApiLogo api={api} />
        <div className="api-card-copy">
          <h3 className="api-card-title">
            {api.title}
            {verified && <VerifiedIcon />}
          </h3>
          <p className="api-card-desc">{description}</p>
        </div>
      </div>

      <div className="api-card-meta">
        <span>{api.companyHub ? api.companyName || api.provider : `By ${api.provider}`}</span>
        {updated ? <span>{updated}</span> : null}
      </div>

      <div className="api-card-metrics">
        <MetricPill icon="◆">{categoryLabel(api.category)}</MetricPill>
        <MetricPill icon="⏱">{cardMetricAuth(api)}</MetricPill>
        <MetricPill icon="📶">{cardMetricReady(api)}</MetricPill>
      </div>
    </Link>
  );
}
