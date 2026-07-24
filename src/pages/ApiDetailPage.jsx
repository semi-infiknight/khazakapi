import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchApi } from "../lib/api.js";
import { FreshnessBadge, TrustDot } from "../components/Badges.jsx";

function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">{label}</h3>
        <button type="button" className="btn-metal text-xs" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="code-block whitespace-pre-wrap">{text}</pre>
    </div>
  );
}

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
    return <div className="container-main py-10 font-mono text-sm text-[var(--text-soft)]">Loading…</div>;
  }

  return (
    <div className="container-main max-w-4xl py-8 pb-16">
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
          <p className="mt-3 font-mono text-xs text-[var(--text-soft)]">
            Health: {api.health.ok ? "OK" : "FAIL"} · HTTP {api.health.status} · {api.health.ms}ms
          </p>
        )}
      </div>

      {api.setup && (
        <div className="panel mt-4 p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">{api.setup.label}</h2>
          <p className="mt-2 text-sm text-[var(--text-soft)]">{api.setup.summary}</p>
          {(api.setup.sections || []).map((section) => (
            <div key={section.title} className="mt-4">
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-soft)]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {api.curl && <CopyBlock label="cURL" text={api.curl} />}
      {api.js && <CopyBlock label="JavaScript" text={api.js} />}
      {api.python && <CopyBlock label="Python" text={api.python} />}
      {api.prompt && <CopyBlock label="AI prompt" text={api.prompt} />}

      {api.docs && (
        <a href={api.docs} target="_blank" rel="noopener noreferrer" className="btn-metal mt-6 inline-flex">
          Provider docs ↗
        </a>
      )}
    </div>
  );
}
