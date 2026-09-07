/*
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PLATFORMS, mcpConnectorUrl } from "../data/mcpSetup.jsx";

function IconCopy() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.5 3.5H3.5A1.5 1.5 0 0 0 2 5v7.5A1.5 1.5 0 0 0 3.5 14H11a1.5 1.5 0 0 0 1.5-1.5V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 2.5H13.5V6.5M13.5 2.5L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClip() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8.8 4.2 4.35 8.65a2.4 2.4 0 1 0 3.4 3.4l5.2-5.2a1.7 1.7 0 1 0-2.4-2.4l-5.15 5.15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4.5 2.5 8 6 11.5M10 4.5 13.5 8 10 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.58c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function KzBadge() {
  return (
    <span className="hf-badge" aria-hidden="true">
      KZ
    </span>
  );
}

function CopyField({ value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "0";
      area.style.left = "0";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.focus();
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(area);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button type="button" className={`hf-copy ${copied ? "hf-copy-ok" : ""}`} onClick={copy} aria-label={copied ? "Copied" : "Copy URL"}>
      <code className="hf-copy-url">{value}</code>
      <span className="hf-copy-btn" aria-hidden="true">
        {copied ? <span className="hf-copy-done">Copied</span> : <IconCopy />}
      </span>
    </button>
  );
}

export default function McpServerPage() {
  const [platformId, setPlatformId] = useState("claude");
  const [mode, setMode] = useState("mcp");

  useEffect(() => {
    document.body.classList.add("hf-mcp-on");
    return () => document.body.classList.remove("hf-mcp-on");
  }, []);

  const connectorUrl = useMemo(() => mcpConnectorUrl(window.location.origin), []);
  const platform = PLATFORMS.find((p) => p.id === platformId) || PLATFORMS[0];
  const config = platform[mode];

  return (
    <div className="hf-mcp">
      <div className="hf-mcp-frame">
        <div className="hf-mcp-bar">
          <div className="hf-mcp-tabs" role="tablist" aria-label="AI platform">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                className={`hf-mcp-tab ${platformId === p.id ? "hf-mcp-tab-active" : ""}`}
                aria-selected={platformId === p.id}
                onClick={() => setPlatformId(p.id)}
              >
                <span className="hf-mcp-tab-icon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hf-mcp-body">
          <div className="hf-mcp-hero">
            <h1 className="hf-mcp-title">
              <span className="hf-mcp-title-icon">{platform.icon}</span>
              Add Qazaq Stack to {platform.label}
              <KzBadge />
            </h1>
            <p className="hf-mcp-desc">
              Connect this Kazakhstan API directory as an {mode.toUpperCase()} server in {platform.label} so you can ask natural-language questions about Kazakh providers, endpoints, and integrations.
            </p>
          </div>

          <div className="hf-mcp-section">
            <div className="hf-mcp-section-head">
              <span className="hf-mcp-section-num">1</span>
              <h2 className="hf-mcp-section-title">Copy the connector URL</h2>
            </div>
            <CopyField value={connectorUrl} />
            <p className="hf-mcp-section-tip">
              This URL exposes the API catalogue as a read-only {mode.toUpperCase()} server. No local code is required.
            </p>
          </div>

          <div className="hf-mcp-section">
            <div className="hf-mcp-section-head">
              <span className="hf-mcp-section-num">2</span>
              <h2 className="hf-mcp-section-title">Paste it into {platform.label}</h2>
            </div>
            <ol className="hf-mcp-steps">
              {config.steps.map((step, i) => (
                <li key={i} className="hf-mcp-step">
                  <span className="hf-mcp-step-icon">{step.icon === "clip" ? <IconClip /> : step.icon === "code" ? <IconCode /> : step.icon === "link" ? <IconLink /> : step.icon === "github" ? <IconGithub /> : null}</span>
                  <span className="hf-mcp-step-text">{step.text}</span>
                </li>
              ))}
            </ol>
            {config.step2Href && (
              <a href={config.step2Href} target="_blank" rel="noopener noreferrer" className="hf-mcp-cta">
                Open {platform.label} settings
                <IconLink />
              </a>
            )}
          </div>

          <div className="hf-mcp-section hf-mcp-section--note">
            <p className="hf-mcp-note">
              <strong>Security note:</strong> this is a stateless remote server. No API keys are stored on the server; any provider credentials you use in chats are handled by your local agent.
            </p>
          </div>
        </div>
      </div>

      <p className="hf-mcp-footer">
        <Link to="/" className="hf-mcp-back">← Back to Qazaq Stack</Link>
      </p>
    </div>
  );
}
*/