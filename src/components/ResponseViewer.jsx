import { useEffect, useMemo, useState } from "react";
import ResponseBody from "./ResponseBody.jsx";
import {
  bodyViewOptions,
  formatBytes,
  formatDuration,
  parseSetCookie,
  responseCopyText,
  statusClass,
  statusLabel,
} from "../lib/formatResponse.js";

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" className="http-btn-ghost" onClick={copy}>
      {copied ? "Copied" : label}
    </button>
  );
}

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
          {tab.count != null && <span className="http-tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

function HeadersTable({ headers }) {
  const rows = Object.entries(headers || {});
  return (
    <div className="http-table-wrap">
      <table className="http-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, value]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{value}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={2} className="http-table-empty">
                No headers captured.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CookiesTable({ cookies }) {
  return (
    <div className="http-table-wrap">
      <table className="http-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th>Attributes</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie) => (
            <tr key={cookie.name + cookie.raw}>
              <td>{cookie.name}</td>
              <td>{cookie.value}</td>
              <td>
                {Object.entries(cookie.attributes)
                  .map(([k, v]) => (v === true ? k : `${k}=${v}`))
                  .join("; ")}
              </td>
            </tr>
          ))}
          {!cookies.length && (
            <tr>
              <td colSpan={3} className="http-table-empty">
                No cookies in this response.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ResponseViewer({ response, request, loading }) {
  const [panelTab, setPanelTab] = useState("body");
  const [bodyMode, setBodyMode] = useState("pretty");
  const [search, setSearch] = useState("");
  const [wrap, setWrap] = useState(true);

  const cookies = useMemo(() => parseSetCookie(response?.headers), [response]);
  const headerCount = Object.keys(response?.headers || {}).length;
  const viewOptions = bodyViewOptions(response?.format);
  const responseKey = response ? `${response.checkedAt}-${response.status}-${response.size}` : "empty";

  useEffect(() => {
    setBodyMode("pretty");
    setSearch("");
    setPanelTab("body");
  }, [responseKey]);

  useEffect(() => {
    if (!viewOptions.some((opt) => opt.id === bodyMode)) {
      setBodyMode("pretty");
    }
  }, [viewOptions, bodyMode]);

  if (loading) {
    return (
      <div className="http-response http-response-empty">
        <div className="http-response-status">
          <span className="http-status http-status-neutral">Sending…</span>
        </div>
        <p className="http-response-placeholder">Waiting for upstream response…</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="http-response http-response-empty">
        <div className="http-response-status">
          <span className="http-status http-status-neutral">Response</span>
        </div>
        <p className="http-response-placeholder">
          Send a request to see status, timing, headers, and a formatted body here — like Postman or Insomnia.
        </p>
      </div>
    );
  }

  const copyText = responseCopyText(response, bodyMode);

  return (
    <div className="http-response">
      <div className="http-response-status">
        <div className="http-response-status-left">
          <span className={`http-status ${statusClass(response.status, response.ok)}`}>
            {statusLabel(response.status, response.statusText)}
          </span>
          <span className="http-meta">{formatDuration(response.ms)}</span>
          <span className="http-meta">{formatBytes(response.size)}</span>
          {response.contentType && (
            <span className="http-meta-chip">{response.format || response.contentType.split(";")[0]}</span>
          )}
          {response.truncated && <span className="http-meta-warn">Body truncated</span>}
        </div>
      </div>

      {response.warning && (
        <div className="banner-warn mb-0 mt-3 text-sm">{response.warning}</div>
      )}

      <TabBar
        active={panelTab}
        onChange={setPanelTab}
        tabs={[
          { id: "body", label: "Body" },
          { id: "headers", label: "Headers", count: headerCount || undefined },
          { id: "cookies", label: "Cookies", count: cookies.length || undefined },
          { id: "request", label: "Request" },
        ]}
      />

      {panelTab === "body" && (
        <div className="http-body-panel">
          <div className="http-body-toolbar">
            <div className="http-body-toolbar-left">
              <span className="http-format-label">{response.format?.toUpperCase() || "TEXT"}</span>
              <div className="http-segment" role="group" aria-label="Body view mode">
                {viewOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`http-segment-btn ${bodyMode === opt.id ? "http-segment-btn-active" : ""}`}
                    aria-pressed={bodyMode === opt.id}
                    onClick={() => setBodyMode(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="http-mode-hint">
                {bodyMode === "pretty" && "Formatted"}
                {bodyMode === "raw" && "Original response"}
                {bodyMode === "preview" &&
                  (response.format === "html"
                    ? "Rendered page"
                    : response.format === "json"
                      ? "Expandable tree"
                      : "Preview")}
              </span>
            </div>
            <div className="http-body-toolbar-right">
              {bodyMode === "preview" && response.format === "json" && (
                <input
                  type="search"
                  placeholder="Search JSON tree…"
                  className="http-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              )}
              <button
                type="button"
                className={`http-btn-ghost ${wrap ? "http-btn-ghost-active" : ""}`}
                onClick={() => setWrap((v) => !v)}
              >
                Wrap
              </button>
              <CopyButton text={copyText} label="Copy" />
            </div>
          </div>

          <div key={bodyMode} className={`http-body-view ${wrap ? "http-body-wrap" : ""}`}>
            <ResponseBody response={response} bodyMode={bodyMode} search={search} />
          </div>
        </div>
      )}

      {panelTab === "headers" && <HeadersTable headers={response.headers} />}

      {panelTab === "cookies" && <CookiesTable cookies={cookies} />}

      {panelTab === "request" && request && (
        <div className="http-request-sent">
          <div className="http-request-block">
            <p className="http-request-label">Method</p>
            <p className="http-request-value">{request.method}</p>
          </div>
          <div className="http-request-block">
            <p className="http-request-label">URL</p>
            <p className="http-request-value http-request-url">{request.url}</p>
          </div>
          <div className="http-request-block">
            <p className="http-request-label">Headers sent</p>
            <pre className="response-raw">
              <code>{JSON.stringify(request.headers, null, 2)}</code>
            </pre>
          </div>
          <div className="http-request-block">
            <div className="http-request-label-row">
              <p className="http-request-label">cURL</p>
              <CopyButton text={request.curl} label="Copy cURL" />
            </div>
            <pre className="response-raw">
              <code>{request.curl}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
