import { useState } from "react";

export function OverviewPanel({ api, spec }) {
  return (
    <div className="http-overview-panel">
      {api.description && (
        <div className="http-overview-section">
          <h4 className="http-overview-subtitle">Description</h4>
          <p className="http-overview-desc">{api.description}</p>
        </div>
      )}

      {api.trust && (
        <div className="http-overview-section">
          <h4 className="http-overview-subtitle">Trust</h4>
          <p className="http-overview-trust">{api.trust.label}</p>
          <p className="http-overview-trust-meta">Source: {api.trust.source}</p>
          {api.trust.sourceUrl && (
            <a href={api.trust.sourceUrl} target="_blank" rel="noopener noreferrer" className="http-link">
              Official source ↗
            </a>
          )}
          {api.trust.caveat && <p className="http-overview-caveat">{api.trust.caveat}</p>}
        </div>
      )}

      {api.health && !api.health.skipped && (
        <div className="http-overview-section">
          <h4 className="http-overview-subtitle">Health</h4>
          <p className="http-overview-trust">
            <span
              className={
                api.health.tone === "live"
                  ? "text-[var(--green)]"
                  : api.health.tone === "reachable"
                    ? "text-[var(--amber)]"
                    : "text-[var(--red)]"
              }
            >
              {api.health.label || (api.health.ok ? "OK" : "FAIL")}
            </span>
            <span className="http-overview-trust-meta"> · HTTP {api.health.status} · {api.health.ms}ms</span>
          </p>
          {api.health.reason && <p className="http-overview-trust-meta">{api.health.reason}</p>}
        </div>
      )}

      {api.docs && (
        <div className="http-overview-section">
          <h4 className="http-overview-subtitle">Documentation</h4>
          <a href={api.docs} target="_blank" rel="noopener noreferrer" className="http-link">
            Provider docs ↗
          </a>
        </div>
      )}
    </div>
  );
}

export function ScriptsPanel({ preRequest, postResponse, onChange }) {
  const [active, setActive] = useState("pre");

  return (
    <div className="http-scripts-panel">
      <div className="http-segment" role="tablist" aria-label="Script type">
        <button
          type="button"
          className={`http-segment-btn ${active === "pre" ? "http-segment-btn-active" : ""}`}
          onClick={() => setActive("pre")}
        >
          Pre-request
        </button>
        <button
          type="button"
          className={`http-segment-btn ${active === "post" ? "http-segment-btn-active" : ""}`}
          onClick={() => setActive("post")}
        >
          Post-response
        </button>
      </div>

      {active === "pre" && (
        <label className="http-field http-field-full">
          <span className="http-field-label">Pre-request script</span>
          <textarea
            className="http-body-textarea http-script-textarea"
            placeholder="// pm.request.headers.add({ key: 'X-Custom', value: 'value' });"
            value={preRequest}
            onChange={(e) => onChange("preRequest", e.target.value)}
            rows={10}
            spellCheck={false}
          />
        </label>
      )}

      {active === "post" && (
        <label className="http-field http-field-full">
          <span className="http-field-label">Post-response script / Tests</span>
          <textarea
            className="http-body-textarea http-script-textarea"
            placeholder="// pm.test('status is 200', () => pm.response.to.have.status(200));"
            value={postResponse}
            onChange={(e) => onChange("postResponse", e.target.value)}
            rows={10}
            spellCheck={false}
          />
        </label>
      )}

      <p className="http-script-note">
        Scripts are stored with the request but not executed in the browser sandbox yet.
      </p>
    </div>
  );
}

export function SettingsPanel({ settings, onChange }) {
  const toggle = (key) => onChange({ ...settings, [key]: !settings[key] });
  const setNum = (key, value) => {
    const n = parseInt(value, 10);
    onChange({ ...settings, [key]: Number.isNaN(n) ? "" : n });
  };

  return (
    <div className="http-settings-panel">
      <div className="http-setting-row">
        <div className="http-setting-info">
          <span className="http-setting-label">Follow redirects</span>
          <span className="http-setting-desc">Follow HTTP 3xx responses as redirects.</span>
        </div>
        <button
          type="button"
          className={`http-toggle ${settings.followRedirects ? "http-toggle-on" : ""}`}
          onClick={() => toggle("followRedirects")}
          aria-pressed={settings.followRedirects}
        >
          <span className="http-toggle-knob" />
        </button>
      </div>

      <div className="http-setting-row">
        <div className="http-setting-info">
          <span className="http-setting-label">SSL certificate verification</span>
          <span className="http-setting-desc">Verify SSL certificates when sending a request.</span>
        </div>
        <button
          type="button"
          className={`http-toggle ${settings.sslVerification ? "http-toggle-on" : ""}`}
          onClick={() => toggle("sslVerification")}
          aria-pressed={settings.sslVerification}
        >
          <span className="http-toggle-knob" />
        </button>
      </div>

      <div className="http-setting-row">
        <div className="http-setting-info">
          <span className="http-setting-label">Encode URL automatically</span>
          <span className="http-setting-desc">Encode the URL path, query parameters, and auth fields.</span>
        </div>
        <button
          type="button"
          className={`http-toggle ${settings.encodeUrl ? "http-toggle-on" : ""}`}
          onClick={() => toggle("encodeUrl")}
          aria-pressed={settings.encodeUrl}
        >
          <span className="http-toggle-knob" />
        </button>
      </div>

      <div className="http-setting-row">
        <div className="http-setting-info">
          <span className="http-setting-label">Disable cookie jar</span>
          <span className="http-setting-desc">Prevent cookies from being stored or sent with this request.</span>
        </div>
        <button
          type="button"
          className={`http-toggle ${settings.disableCookieJar ? "http-toggle-on" : ""}`}
          onClick={() => toggle("disableCookieJar")}
          aria-pressed={settings.disableCookieJar}
        >
          <span className="http-toggle-knob" />
        </button>
      </div>

      <div className="http-setting-row http-setting-row-inline">
        <label className="http-setting-info">
          <span className="http-setting-label">Request timeout</span>
          <span className="http-setting-desc">Milliseconds to wait before aborting the request.</span>
        </label>
        <input
          type="number"
          className="http-input http-input-timeout"
          value={settings.timeout}
          onChange={(e) => setNum("timeout", e.target.value)}
          min={1000}
          max={60000}
          step={1000}
        />
      </div>
    </div>
  );
}

export function CookiesPanel({ requestUrl }) {
  return (
    <div className="http-cookies-panel">
      <p className="http-empty-note">Cookie jar management is not enabled for this request.</p>
      {requestUrl && (
        <p className="http-cookies-domain">
          Domain: <code>{new URL(requestUrl).host}</code>
        </p>
      )}
    </div>
  );
}
