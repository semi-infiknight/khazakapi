import { Link } from "react-router-dom";
import ApiLogo from "./ApiLogo.jsx";
import {
  apiDescription,
  cardMetricLatency,
  cardMetricScore,
  categoryLabel,
  categoryStyle,
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
  const badge = categoryStyle(api.category);
  const verified = api.tier === "open" && api.copyable;
  const description = apiDescription(api);

  return (
    <Link to={`/apis/${api.slug || api.id}`} className="card api-card block">
      <div className="api-card-top">
        <span
          className="api-card-category"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          {categoryLabel(api.category)}
        </span>
      </div>

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
        <span>By {api.provider}</span>
        <span>{updatedLabel(api.freshness, api.trust?.lastChecked)}</span>
      </div>

      <div className="api-card-metrics">
        <MetricPill icon="↗">{cardMetricScore(api)}</MetricPill>
        <MetricPill icon="⏱">{cardMetricLatency(api)}</MetricPill>
        <MetricPill icon="📶">{api.copyable ? "100%" : "Setup"}</MetricPill>
      </div>
    </Link>
  );
}
