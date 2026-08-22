import { useEffect, useMemo, useState } from "react";
import { tryApi } from "../lib/api.js";

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-4 border border-[var(--line)] rounded-md">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <span className="text-[var(--text-mute)]">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="border-t border-[var(--line)] px-3 py-3">{children}</div>}
    </div>
  );
}

function ParamTable({ parameters, values, onChange }) {
  if (!parameters.length) {
    return <p className="text-sm text-[var(--text-soft)]">No query parameters for this endpoint.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--line)] text-[var(--text-mute)]">
            <th className="py-2 pr-3 font-mono font-semibold">Name</th>
            <th className="py-2 pr-3 font-mono font-semibold">In</th>
            <th className="py-2 pr-3 font-mono font-semibold">Description</th>
            <th className="py-2 font-mono font-semibold">Value</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.name} className="border-b border-[var(--line)] align-top">
              <td className="py-2 pr-3 font-mono text-[var(--text)]">
                {param.name}
                {param.required && <span className="ml-1 text-[var(--red)]">*</span>}
              </td>
              <td className="py-2 pr-3 font-mono text-[var(--text-soft)]">{param.in}</td>
              <td className="py-2 pr-3 text-[var(--text-soft)]">{param.description}</td>
              <td className="py-2">
                <input
                  type={param.sensitive ? "password" : "text"}
                  autoComplete="off"
                  placeholder={param.example || ""}
                  className="w-full min-w-[140px] rounded border border-[var(--line)] bg-[var(--code-bg)] px-2 py-1.5 font-mono text-[11px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  value={values[param.name] ?? ""}
                  onChange={(e) => onChange(param.name, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--line)] pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
            active === tab.id
              ? "bg-[var(--surface-alt)] text-[var(--text)]"
              : "text-[var(--text-mute)] hover:text-[var(--text-soft)]"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" className="btn-metal text-[10px]" onClick={copy}>
      {copied ? "Copied" : label}
    </button>
  );
}

function statusTone(status, ok) {
  if (!status) return "text-[var(--amber)]";
  if (ok) return "text-[var(--green)]";
  if (status >= 400) return "text-[var(--red)]";
  return "text-[var(--amber)]";
}

export default function ApiTryPanel({ api }) {
  const spec = api.trySpec;
  const defaults = spec?.defaults?.params || {};
  const defaultHeaders = spec?.defaults?.headers || { Accept: "application/json, text/plain, */*" };

  const [params, setParams] = useState(defaults);
  const [headers, setHeaders] = useState(defaultHeaders);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [responseTab, setResponseTab] = useState("body");

  useEffect(() => {
    setParams(spec?.defaults?.params || {});
    setHeaders(spec?.defaults?.headers || { Accept: "application/json, text/plain, */*" });
    setApiKey("");
    setResult(null);
    setError(null);
    setResponseTab("body");
  }, [api.id, spec]);

  const showKeyField = useMemo(() => {
    if (!api.endpoint) return false;
    return spec?.auth?.required || api.endpoint.includes("YOUR_KEY");
  }, [api, spec]);

  const previewCurl = useMemo(() => {
    if (result?.request?.curl) return result.request.curl;
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      let v = String(value);
      if (v.includes("YOUR_KEY") && apiKey) v = v.replace(/YOUR_KEY/g, apiKey);
      qs.set(key, v);
    }
    const base = spec?.baseUrl || "";
    const path = spec?.path || "";
    let url = `${base}${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
    if (apiKey) url = url.replace(/YOUR_KEY/g, apiKey);
    return `curl -G '${url.replace(/'/g, "'\\''")}' \\\n  -H 'Accept: application/json'`;
  }, [params, apiKey, spec, result]);

  if (!spec?.available) {
    return (
      <div className="panel mt-6 p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">API tester</h2>
        <p className="mt-2 text-sm text-[var(--text-soft)]">{spec?.reason || "Testing is not available for this entry."}</p>
      </div>
    );
  }

  const send = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await tryApi(api.id, {
        params,
        headers,
        apiKey: apiKey || undefined,
      });
      setResult(data);
      setResponseTab("body");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setParams(defaults);
    setHeaders(defaultHeaders);
    setApiKey("");
    setResult(null);
    setError(null);
  };

  const response = result?.response;
  const request = result?.request;

  return (
    <div className="panel mt-6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">API tester</h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Build the request, send it live, and inspect status, headers, and body.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="chip bg-[var(--green)]/15 text-[var(--green)]">{spec.method}</span>
          <span className="chip">{spec.host}</span>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-[var(--line)] bg-[var(--code-bg)] px-3 py-2 font-mono text-[11px] text-[var(--text-soft)]">
        <span className="text-[var(--green)]">{spec.method}</span> {spec.path}
      </div>

      {spec.notes?.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--text-mute)]">
          {spec.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <Section title="Parameters">
        <ParamTable
          parameters={spec.parameters}
          values={params}
          onChange={(name, value) => setParams((prev) => ({ ...prev, [name]: value }))}
        />
      </Section>

      <Section title="Authentication">
        <div className="space-y-3 text-sm">
          <p className="text-[var(--text-soft)]">
            <span className="font-mono text-[var(--text)]">{spec.auth.label}</span>
            {spec.auth.placement && <span className="text-[var(--text-mute)]"> · {spec.auth.placement}</span>}
          </p>
          {showKeyField ? (
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">
                {spec.auth.type === "bearer" ? "Bearer token" : "API key"}
              </span>
              <input
                type="password"
                autoComplete="off"
                placeholder={api.endpoint.includes("YOUR_KEY") ? "Replaces YOUR_KEY in query params" : "Required to call this API"}
                className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--code-bg)] px-3 py-2 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </label>
          ) : (
            <p className="text-[var(--text-mute)]">No credentials required for this endpoint.</p>
          )}
          {spec.auth.docs && (
            <a href={spec.auth.docs} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-[var(--accent)] underline">
              Provider auth docs ↗
            </a>
          )}
        </div>
      </Section>

      <Section title="Headers" defaultOpen={false}>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">Accept</span>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--code-bg)] px-3 py-2 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
            value={headers.Accept || ""}
            onChange={(e) => setHeaders((prev) => ({ ...prev, Accept: e.target.value }))}
          />
        </label>
      </Section>

      <Section title="Request preview">
        <div className="mb-2 flex justify-end">
          <CopyButton text={previewCurl} label="Copy cURL" />
        </div>
        <pre className="code-block max-h-40 overflow-auto whitespace-pre-wrap text-[11px]">{previewCurl}</pre>
      </Section>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-metal text-sm" onClick={send} disabled={loading}>
          {loading ? "Sending…" : "Send request"}
        </button>
        <button type="button" className="btn-metal text-sm opacity-80" onClick={reset} disabled={loading}>
          Reset
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--red)]">{error}</p>}

      {response && (
        <div className="mt-5 border-t border-[var(--line)] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className={statusTone(response.status, response.ok)}>
                {response.status ? `${response.status} ${response.statusText}` : response.statusText}
              </span>
              <span className="text-[var(--text-mute)]">{response.ms}ms</span>
              {response.size > 0 && <span className="text-[var(--text-mute)]">{response.size.toLocaleString()} bytes</span>}
              {response.contentType && (
                <span className="chip text-[10px]">{response.format || response.contentType.split(";")[0]}</span>
              )}
              {response.truncated && <span className="text-[var(--amber)]">body truncated</span>}
            </div>
            {responseTab === "body" && <CopyButton text={response.body || ""} label="Copy body" />}
          </div>

          <div className="mt-3">
            <TabBar
              active={responseTab}
              onChange={setResponseTab}
              tabs={[
                { id: "body", label: "Response body" },
                { id: "headers", label: "Response headers" },
                { id: "request", label: "Request sent" },
              ]}
            />
          </div>

          {responseTab === "body" && (
            <pre className="code-block mt-3 max-h-[480px] overflow-auto whitespace-pre-wrap text-[11px]">
              {response.body || "(empty body)"}
            </pre>
          )}

          {responseTab === "headers" && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--text-mute)]">
                    <th className="py-2 pr-3 font-mono">Header</th>
                    <th className="py-2 font-mono">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(response.headers || {}).map(([name, value]) => (
                    <tr key={name} className="border-b border-[var(--line)] align-top">
                      <td className="py-2 pr-3 font-mono text-[var(--text-soft)]">{name}</td>
                      <td className="py-2 font-mono text-[var(--text)] break-all">{value}</td>
                    </tr>
                  ))}
                  {!Object.keys(response.headers || {}).length && (
                    <tr>
                      <td colSpan={2} className="py-3 text-[var(--text-mute)]">
                        No response headers captured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {responseTab === "request" && request && (
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">URL</p>
                <p className="mt-1 break-all font-mono text-[var(--text-soft)]">{request.url}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">Method</p>
                <p className="mt-1 font-mono text-[var(--text-soft)]">{request.method}</p>
              </div>
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">Headers sent</p>
                <pre className="code-block whitespace-pre-wrap">{JSON.stringify(request.headers, null, 2)}</pre>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">cURL</p>
                  <CopyButton text={request.curl} label="Copy cURL" />
                </div>
                <pre className="code-block whitespace-pre-wrap">{request.curl}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
