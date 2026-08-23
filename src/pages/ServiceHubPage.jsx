import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchApi, fetchService } from "../lib/api.js";
import { FreshnessBadge, TrustDot } from "../components/Badges.jsx";
import ApiTryPanel from "../components/ApiTryPanel.jsx";
import CodeSnippetsPanel from "../components/CodeSnippetsPanel.jsx";
import EgovKeySetup from "../components/EgovKeySetup.jsx";
import ServiceEndpointNav from "../components/ServiceEndpointNav.jsx";
import { isDataEgovApi } from "../lib/providerKeys.js";

function ServiceOverview({ service }) {
  const navigate = useNavigate();
  const first = service.groups[0]?.endpoints[0];

  useEffect(() => {
    if (first) navigate(`/services/${service.slug}/${first.slug || first.id}`, { replace: true });
  }, [first, navigate, service.slug]);

  return (
    <div className="service-main-empty">
      <p className="font-mono text-sm text-[var(--text-soft)]">Select an endpoint from the left to explore this service.</p>
    </div>
  );
}

function EndpointDetail({ api, service }) {
  const method = api.trySpec?.method || "GET";

  return (
    <div className="service-main-content">
      <nav className="service-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="service-breadcrumb-link">
          Catalogue
        </Link>
        <span className="service-breadcrumb-sep">/</span>
        <Link to={`/services/${service.slug}`} className="service-breadcrumb-link">
          {service.name}
        </Link>
        <span className="service-breadcrumb-sep">/</span>
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

export default function ServiceHubPage() {
  const { serviceSlug, apiId } = useParams();
  const [service, setService] = useState(null);
  const [api, setApi] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    fetchService(serviceSlug)
      .then(setService)
      .catch((e) => setError(e.message));
  }, [serviceSlug]);

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

  if (!service) {
    return <div className="container-main py-10 font-mono text-sm text-[var(--text-soft)]">Loading service…</div>;
  }

  return (
    <div className="service-hub-layout container-main pb-16 pt-6">
      <ServiceEndpointNav service={service} />
      <main className="service-main panel">
        {!apiId && <ServiceOverview service={service} />}
        {apiId && !api && <p className="p-6 font-mono text-sm text-[var(--text-soft)]">Loading endpoint…</p>}
        {api && <EndpointDetail api={api} service={service} />}
      </main>
    </div>
  );
}
