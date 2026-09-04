import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchApi } from "../lib/api.js";
import { FreshnessBadge, TrustDot } from "../components/Badges.jsx";
import ApiTryPanel from "../components/ApiTryPanel.jsx";
import CodeSnippetsPanel from "../components/CodeSnippetsPanel.jsx";
import ApiKeyBanner from "../components/ApiKeyBanner.jsx";
import { PageSkeleton } from "../components/PageSkeleton.jsx";

export default function ApiDetailPage() {
  const { id } = useParams();
  const [api, setApi] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApi(id)
      .then(setApi)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="container-main py-10">
        <p className="text-[var(--red)]">{error}</p>
        <Link to="/" className="mt-4 inline-block font-mono text-sm text-[var(--accent)]">
          ← back to directory
        </Link>
      </div>
    );
  }

  if (!api) {
    return <PageSkeleton variant="detail" />;
  }

  if (api.hubPath) {
    return <Navigate to={api.hubPath} replace />;
  }

  if (api.companyHub && api.categorySlug && api.companySlug) {
    return <Navigate to={`/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`} replace />;
  }

  return (
    <div className="container-main max-w-5xl py-8 pb-16">
      <Link to="/" className="font-mono text-xs text-[var(--text-soft)] hover:text-[var(--text)]">
        ← back to directory
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <FreshnessBadge freshness={api.freshness} />
        <TrustDot copyable={api.copyable} auth={api.auth} />
        <span className="chip">{api.tier}</span>
        <span className="chip">{api.pricing}</span>
        <span className="chip">{api.auth}</span>
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight">{api.title}</h1>
      <p className="mt-2 font-mono text-sm text-[var(--text-soft)]">
        {api.provider} · {api.category} · {(api.country || []).join(", ")}
      </p>

      {api.note && <p className="mt-4 text-sm text-[var(--amber)]">{api.note}</p>}

      <CodeSnippetsPanel api={api} />

      <div className="panel mt-6 p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Trust</h2>
        <p className="mt-2 text-sm text-[var(--text-soft)]">{api.trust?.label}</p>
        <p className="mt-1 text-sm text-[var(--text-soft)]">Source: {api.trust?.source}</p>
        {api.trust?.sourceUrl && (
          <a href={api.trust.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-[var(--accent)] underline">
            Official source ↗
          </a>
        )}
        <p className="mt-3 text-sm text-[var(--text-mute)]">{api.trust?.caveat}</p>
        {api.health && !api.health.skipped && (
          <p className="mt-3 font-mono text-xs">
            <span
              className={
                api.health.tone === "live"
                  ? "text-[var(--green)]"
                  : api.health.tone === "reachable"
                    ? "text-[var(--amber)]"
                    : "text-[var(--red)]"
              }
            >
              Health: {api.health.label || (api.health.ok ? "OK" : "FAIL")}
            </span>
            <span className="text-[var(--text-soft)]">
              {" "}
              · HTTP {api.health.status} · {api.health.ms}ms
            </span>
            {api.health.reason && (
              <span className="mt-1 block text-[var(--text-mute)]">{api.health.reason}</span>
            )}
          </p>
        )}
      </div>

      <ApiKeyBanner api={api} />

      <ApiTryPanel api={api} />

      {api.docs && (
        <a href={api.docs} target="_blank" rel="noopener noreferrer" className="btn-metal mt-6 inline-flex">
          Provider docs ↗
        </a>
      )}
    </div>
  );
}
