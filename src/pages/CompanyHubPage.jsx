import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchApi, fetchCompanyHub } from "../lib/api.js";
import { FreshnessBadge, TrustDot } from "../components/Badges.jsx";
import ApiTryPanel from "../components/ApiTryPanel.jsx";
import CodeSnippetsPanel from "../components/CodeSnippetsPanel.jsx";
import EgovKeySetup from "../components/EgovKeySetup.jsx";
import CompanyEndpointNav from "../components/CompanyEndpointNav.jsx";
import { isDataEgovApi } from "../lib/providerKeys.js";
import { categoryLabel } from "../lib/categoryStyle.js";

function HubOverview({ hub }) {
  const navigate = useNavigate();
  const first = hub.groups[0]?.endpoints[0];

  useEffect(() => {
    if (first) {
      navigate(`/browse/${hub.category.slug}/${hub.company.slug}/${first.slug || first.id}`, { replace: true });
    }
  }, [first, hub.category.slug, hub.company.slug, navigate]);

  return (
    <div className="service-main-empty">
      <p className="font-mono text-sm text-[var(--text-soft)]">Select an API type from the left, then pick an endpoint.</p>
    </div>
  );
}

function EndpointDetail({ api, hub }) {
  const method = api.trySpec?.method || "GET";

  return (
    <div className="service-main-content">
      <nav className="service-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="service-breadcrumb-link">
          Catalogue
        </Link>
        <span className="service-breadcrumb-sep">/</span>
        <Link to="/" state={{ category: hub.category.name }} className="service-breadcrumb-link">
          {categoryLabel(hub.category.name)}
        </Link>
        <span className="service-breadcrumb-sep">/</span>
        <Link to={`/browse/${hub.category.slug}/${hub.company.slug}`} className="service-breadcrumb-link">
          {hub.company.name}
        </Link>
        <span className="service-breadcrumb-sep">/</span>
        {api.apiType && (
          <>
            <span className="service-breadcrumb-link">{api.apiType}</span>
            <span className="service-breadcrumb-sep">/</span>
          </>
        )}
        <span className="service-breadcrumb-current">
          <span className="service-nav-method">{method}</span>
          {api.title}
        </span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <FreshnessBadge freshness={api.freshness} />
        <TrustDot copyable={api.copyable} auth={api.auth} />
        <span className="chip">{api.tier}</span>
        <span className="chip">{api.pricing}</span>
        <span className="chip">{api.auth}</span>
      </div>

      <h2 className="mt-4 text-2xl font-bold leading-tight">{api.title}</h2>
      <p className="mt-2 font-mono text-sm text-[var(--text-soft)]">{(api.country || []).join(", ")}</p>

      {api.note && <p className="mt-4 text-sm text-[var(--amber)]">{api.note}</p>}

      <CodeSnippetsPanel api={api} />

      <div className="panel mt-6 p-5">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Trust</h3>
        <p className="mt-2 text-sm text-[var(--text-soft)]">{api.trust?.label}</p>
        <p className="mt-1 text-sm text-[var(--text-soft)]">Source: {api.trust?.source}</p>
        {api.trust?.sourceUrl && (
          <a
            href={api.trust.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-[var(--accent)] underline"
          >
            Official source ↗
          </a>
        )}
        <p className="mt-3 text-sm text-[var(--text-mute)]">{api.trust?.caveat}</p>
      </div>

      {isDataEgovApi(api) && <EgovKeySetup compact />}

      <ApiTryPanel api={api} />

      {api.docs && (
        <a href={api.docs} target="_blank" rel="noopener noreferrer" className="btn-metal mt-6 inline-flex">
          Provider docs ↗
        </a>
      )}
    </div>
  );
}

export default function CompanyHubPage() {
  const { categorySlug, companySlug, apiId } = useParams();
  const [hub, setHub] = useState(null);
  const [api, setApi] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    fetchCompanyHub(categorySlug, companySlug)
      .then(setHub)
      .catch((e) => setError(e.message));
  }, [categorySlug, companySlug]);

  useEffect(() => {
    if (!apiId) {
      setApi(null);
      return;
    }
    fetchApi(apiId)
      .then(setApi)
      .catch((e) => setError(e.message));
  }, [apiId]);

  if (error) {
    return (
      <div className="container-main py-10">
        <p className="text-[var(--red)]">{error}</p>
        <Link to="/" className="mt-4 inline-block font-mono text-sm text-[var(--accent)]">
          ← back to catalogue
        </Link>
      </div>
    );
  }

  if (!hub) {
    return <div className="container-main py-10 font-mono text-sm text-[var(--text-soft)]">Loading company hub…</div>;
  }

  return (
    <div className="service-hub-layout container-main pb-16 pt-6">
      <CompanyEndpointNav hub={hub} />
      <main className="service-main panel">
        {!apiId && <HubOverview hub={hub} />}
        {apiId && !api && <p className="p-6 font-mono text-sm text-[var(--text-soft)]">Loading endpoint…</p>}
        {api && <EndpointDetail api={api} hub={hub} />}
      </main>
    </div>
  );
}
