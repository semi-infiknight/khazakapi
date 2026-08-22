import { Link } from "react-router-dom";
import ApiLogo from "./ApiLogo.jsx";
import {
  apiDescription,
  categoryLabel,
  categoryStyle,
  updatedLabel,
} from "../lib/categoryStyle.js";

function MetricPill({ icon, children }) {
  return (
    <span className="hub-metric">
      <span className="hub-metric-icon" aria-hidden="true">
        {icon}
      </span>
      {children}
    </span>
  );
}

function VerifiedIcon() {
  return (
    <svg className="hub-verified" viewBox="0 0 16 16" fill="none" aria-label="Verified open data">
      <circle cx="8" cy="8" r="8" fill="#0081F1" />
      <path d="M4.5 8.1L6.8 10.4L11.5 5.7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ApiCard({ api }) {
  const badge = categoryStyle(api.category);
  const verified = api.tier === "open" && api.copyable;
  const description = apiDescription(api);

  return (
    <Link to={`/apis/${api.slug || api.id}`} className="hub-card">
      <div className="hub-card-top">
        <span
          className="hub-category-badge"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          {categoryLabel(api.category)}
        </span>
      </div>

      <div className="hub-card-body">
        <ApiLogo api={api} />
        <div className="hub-card-copy">
          <h3 className="hub-card-title">
            {api.title}
            {verified && <VerifiedIcon />}
          </h3>
          <p className="hub-card-desc">{description}</p>
        </div>
      </div>

      <div className="hub-card-meta">
        <span>By {api.provider}</span>
        <span>{updatedLabel(api.freshness)}</span>
      </div>

      <div className="hub-card-metrics">
        <MetricPill icon="★">{api.pricing === "free" ? "Free" : "Paid"}</MetricPill>
        <MetricPill icon="⏱">
          {api.auth === "none" ? "No auth" : api.auth === "apiKey" ? "API key" : api.auth}
        </MetricPill>
        <MetricPill icon="↗">{api.copyable ? "100%" : "Setup"}</MetricPill>
      </div>
    </Link>
  );
}
