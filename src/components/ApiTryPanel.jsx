import { useEffect, useMemo, useState } from "react";
import { tryApi } from "../lib/api.js";
import { getProviderIdForApi, getProviderKey } from "../lib/providerKeys.js";
import ResponseViewer from "./ResponseViewer.jsx";

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="http-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`http-tab ${active === tab.id ? "http-tab-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ParamTable({ parameters, values, onChange }) {
  if (!parameters.length) {
    return <p className="http-empty-note">No query parameters for this endpoint.</p>;
  }

  return (
    <div className="http-table-wrap">
      <table className="http-table">
        <thead>
          <tr>
            <th className="http-col-check">✓</th>
            <th>Key</th>
            <th>Value</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.name}>
              <td className="http-col-check">
                <input type="checkbox" checked readOnly aria-label={`Use ${param.name}`} />
              </td>
              <td className="http-param-key">
                {param.name}
                {param.required && <span className="http-required">*</span>}
              </td>
              <td>
                <input
                  type={param.sensitive ? "password" : "text"}
                  autoComplete="off"
                  placeholder={param.example || ""}
                  className="http-input"
                  value={values[param.name] ?? ""}
                  onChange={(e) => onChange(param.name, e.target.value)}
                />
              </td>
              <td className="http-param-desc">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildPreviewUrl(spec, params, apiKey) {
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
  return url;
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
  const [requestTab, setRequestTab] = useState("params");

  const providerId = useMemo(() => getProviderIdForApi(api), [api]);

  useEffect(() => {
    setParams(spec?.defaults?.params || {});
    setHeaders(spec?.defaults?.headers || { Accept: "application/json, text/plain, */*" });
    setApiKey(providerId ? getProviderKey(providerId) : "");
    setResult(null);
    setError(null);
    setRequestTab("params");
  }, [api.id, spec, api, providerId]);

  useEffect(() => {
    if (!providerId) return;
    const syncKey = () => setApiKey(getProviderKey(providerId));
    window.addEventListener("khazak:provider-key", syncKey);
    return () => window.removeEventListener("khazak:provider-key", syncKey);
  }, [providerId]);

  const showKeyField = useMemo(() => {
    if (!api.endpoint) return false;
    return spec?.auth?.required || api.endpoint.includes("YOUR_KEY");
  }, [api, spec]);

  const previewUrl = useMemo(
    () => buildPreviewUrl(spec, params, apiKey),
    [spec, params, apiKey]
  );

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
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setParams(defaults);
    setHeaders(defaultHeaders);
    setApiKey(providerId ? getProviderKey(providerId) : "");
    setResult(null);
    setError(null);
  };

  const requestTabs = [
    { id: "params", label: "Params" },
    ...(showKeyField ? [{ id: "auth", label: "Auth" }] : []),
    { id: "headers", label: "Headers" },
  ];

  return (
    <div className="http-tester panel mt-6">
      <div className="http-tester-head">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">API tester</h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Postman-style request builder with formatted JSON responses.
          </p>
        </div>
      </div>

      <div className="http-request-bar">
        <span className={`http-method http-method-${spec.method.toLowerCase()}`}>{spec.method}</span>
        <input
          type="text"
          readOnly
          value={previewUrl}
          className="http-url-input"
          aria-label="Request URL"
        />
        <button type="button" className="http-send-btn" onClick={send} disabled={loading}>
          {loading ? "Sending…" : "Send"}
        </button>
        <button type="button" className="http-btn-ghost" onClick={reset} disabled={loading}>
          Reset
        </button>
      </div>

      {spec.notes?.length > 0 && (
        <ul className="http-notes">
          {spec.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <TabBar tabs={requestTabs} active={requestTab} onChange={setRequestTab} />

      <div className="http-request-panel">
        {requestTab === "params" && (
          <ParamTable
            parameters={spec.parameters}
            values={params}
            onChange={(name, value) => setParams((prev) => ({ ...prev, [name]: value }))}
          />
        )}

        {requestTab === "auth" && (
          <div className="http-auth-panel">
            <p className="http-auth-type">
              <span className="font-mono text-[var(--text)]">{spec.auth.label}</span>
              {spec.auth.placement && <span className="text-[var(--text-mute)]"> · {spec.auth.placement}</span>}
            </p>
            {providerId && !apiKey && (
              <p className="http-auth-hint">
                No saved key for this provider —{" "}
                <a href={`/keys?provider=${encodeURIComponent(providerId)}`} className="text-[var(--accent)] underline">
                  add it in Keys
                </a>{" "}
                once to auto-fill live testing.
              </p>
            )}
            <label className="http-field">
              <span className="http-field-label">
                {spec.auth.type === "bearer" ? "Bearer token" : "API key"}
              </span>
              <input
                type="password"
                autoComplete="off"
                placeholder={
                  api.endpoint.includes("YOUR_KEY")
                    ? "Replaces YOUR_KEY in query params"
                    : "Required to call this API"
                }
                className="http-input http-input-wide"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </label>
            {spec.auth.docs && (
              <a href={spec.auth.docs} target="_blank" rel="noopener noreferrer" className="http-link">
                Provider auth docs ↗
              </a>
            )}
          </div>
        )}

        {requestTab === "headers" && (
          <div className="http-headers-panel">
            <label className="http-field">
              <span className="http-field-label">Accept</span>
              <input
                type="text"
                className="http-input http-input-wide"
                value={headers.Accept || ""}
                onChange={(e) => setHeaders((prev) => ({ ...prev, Accept: e.target.value }))}
              />
            </label>
          </div>
        )}
      </div>

      {error && <p className="http-error">{error}</p>}

      {result && (
        <div className="http-console">
          <div className="http-console-line">
            <span className="http-console-tag">REQUEST</span>
            <span>{result.request?.method} {result.request?.url}</span>
          </div>
          <div className="http-console-line">
            <span className="http-console-tag">RESPONSE</span>
            <span>
              {result.response?.status
                ? `${result.response.status} ${result.response.statusText || ""}`.trim()
                : result.response?.statusText}{" "}
              · {result.response?.ms}ms
            </span>
          </div>
        </div>
      )}

      <ResponseViewer response={result?.response} request={result?.request} loading={loading && !result} />
    </div>
  );
}
