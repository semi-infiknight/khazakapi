import { useMemo, useState } from "react";
import { tryApi } from "../lib/api.js";

function needsApiKey(api) {
  if (!api?.endpoint) return false;
  return api.auth !== "none" || api.endpoint.includes("YOUR_KEY");
}

function formatBody(result) {
  if (!result) return "";
  return result.body || "";
}

export default function ApiTryPanel({ api }) {
  const [url, setUrl] = useState(api.endpoint || "");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const showKeyField = useMemo(() => needsApiKey(api), [api]);

  if (!api.endpoint) {
    return (
      <div className="panel mt-6 p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Try it out</h2>
        <p className="mt-2 text-sm text-[var(--text-soft)]">
          No live endpoint is catalogued for this API. Check the provider docs to integrate.
        </p>
      </div>
    );
  }

  const send = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await tryApi(api.id, { url, apiKey: apiKey || undefined });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const statusClass = result?.ok ? "text-[var(--green)]" : "text-[var(--red)]";

  return (
    <div className="panel mt-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Try it out</h2>
        <span className="chip font-mono text-[10px]">GET</span>
      </div>
      <p className="mt-2 text-sm text-[var(--text-soft)]">
        Send a live request through Khazak API and inspect the response — like Swagger&apos;s &quot;Try it out&quot;.
      </p>

      <label className="mt-4 block">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">Request URL</span>
        <input
          type="url"
          className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--code-bg)] px-3 py-2 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          spellCheck={false}
        />
      </label>

      {showKeyField && (
        <label className="mt-3 block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">API key</span>
          <input
            type="password"
            autoComplete="off"
            placeholder={api.endpoint.includes("YOUR_KEY") ? "Replaces YOUR_KEY in the URL" : "Your provider API key"}
            className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--code-bg)] px-3 py-2 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>
      )}

      <button type="button" className="btn-metal mt-4 text-sm" onClick={send} disabled={loading || !url.trim()}>
        {loading ? "Sending…" : "Send request"}
      </button>

      {error && <p className="mt-3 text-sm text-[var(--red)]">{error}</p>}

      {result && (
        <div className="mt-4 border-t border-[var(--line)] pt-4">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className={statusClass}>
              {result.status ? `HTTP ${result.status}` : result.statusText} {result.statusText && result.status ? `· ${result.statusText}` : ""}
            </span>
            <span className="text-[var(--text-mute)]">{result.ms}ms</span>
            {result.size > 0 && <span className="text-[var(--text-mute)]">{result.size.toLocaleString()} bytes</span>}
            {result.truncated && <span className="text-[var(--amber)]">truncated</span>}
          </div>
          <pre className="code-block mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap">{formatBody(result)}</pre>
        </div>
      )}
    </div>
  );
}
