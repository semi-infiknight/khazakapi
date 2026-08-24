import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MCP_TOOLS, PLATFORMS, mcpConnectorUrl } from "../data/mcpSetup.js";

function CopyField({ value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mcp-copy-field">
      <code className="mcp-copy-value">{value}</code>
      <button type="button" className="mcp-copy-btn" onClick={copy} aria-label="Copy to clipboard">
        {copied ? "✓" : "⧉"}
      </button>
    </div>
  );
}

function StepCard({ number, title, children }) {
  return (
    <article className="mcp-step-card">
      <div className="mcp-step-head">
        <span className="mcp-step-num">{number}</span>
        <h2 className="mcp-step-title">{title}</h2>
      </div>
      <div className="mcp-step-body">{children}</div>
    </article>
  );
}

export default function McpServerPage() {
  const [platformId, setPlatformId] = useState("claude");
  const [mode, setMode] = useState("mcp");

  const connectorUrl = useMemo(() => mcpConnectorUrl(window.location.origin), []);
  const platform = PLATFORMS.find((p) => p.id === platformId) || PLATFORMS[0];
  const config = platform[mode];

  return (
    <div className="mcp-page container-main pb-20 pt-8">
      <div className="mcp-page-top">
        <div>
          <Link to="/" className="font-mono text-xs text-[var(--text-soft)] hover:text-[var(--text)]">
            ← back to directory
          </Link>
          <h1 className="mcp-page-title">MCP server</h1>
          <p className="mcp-page-lede">
            Connect Khazak API to your AI assistant — search 688 Kazakhstan APIs, fetch entries, and list categories
            from Claude, Cursor, ChatGPT, and more.
          </p>
        </div>

        <div className="mcp-mode-toggle" role="tablist" aria-label="Setup mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "mcp"}
            className={`mcp-mode-btn ${mode === "mcp" ? "mcp-mode-btn-active" : ""}`}
            onClick={() => setMode("mcp")}
          >
            <span aria-hidden="true">🔗</span> MCP
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "cli"}
            className={`mcp-mode-btn ${mode === "cli" ? "mcp-mode-btn-active" : ""}`}
            onClick={() => setMode("cli")}
          >
            <span aria-hidden="true">&lt;/&gt;</span> CLI
          </button>
        </div>
      </div>

      <div className="mcp-platform-tabs" role="tablist" aria-label="AI platform">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={platformId === p.id}
            className={`mcp-platform-tab ${platformId === p.id ? "mcp-platform-tab-active" : ""}`}
            onClick={() => setPlatformId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mcp-steps-grid">
        <StepCard number="1" title={mode === "mcp" ? "Copy the Khazak API connector URL" : "Copy the connector URL or CLI snippet"}>
          <p className="mcp-step-desc">
            {mode === "mcp"
              ? "You'll paste this URL into your assistant's MCP connector settings in the next step."
              : "Use the URL in config files or the snippet below for CLI-based MCP setup."}
          </p>
          <CopyField value={connectorUrl} />
          {mode === "cli" && config.step2Snippet && (
            <div className="mt-4">
              <p className="mcp-step-desc mb-2">CLI config snippet</p>
              <CopyField value={config.step2Snippet(connectorUrl)} />
            </div>
          )}
        </StepCard>

        <StepCard number="2" title={config.step2Title}>
          <p className="mcp-step-desc">{config.step2Body}</p>
          {config.step2Action && (
            <a
              href={config.step2Action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mcp-link-btn"
            >
              {config.step2Action.label} ↗
            </a>
          )}
        </StepCard>

        <StepCard number="3" title="Connect, sign in and start">
          <p className="mcp-step-desc">{config.step3Body}</p>
          {config.cta && (
            <a href={config.cta.href} target="_blank" rel="noopener noreferrer" className="mcp-cta-btn">
              {config.cta.label}
            </a>
          )}
        </StepCard>
      </div>

      <section className="mcp-tools panel mt-8 p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Available tools</h2>
        <ul className="mcp-tools-list mt-3">
          {MCP_TOOLS.map((tool) => (
            <li key={tool.name} className="mcp-tools-item">
              <code className="mcp-tools-name">{tool.name}</code>
              <span className="mcp-tools-desc">{tool.description}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--text-soft)]">
          Endpoint metadata:{" "}
          <a href="/mcp" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline">
            GET /mcp
          </a>{" "}
          · REST fallback:{" "}
          <a href="/api/search?q=NBK" className="text-[var(--accent)] underline">
            /api/search
          </a>
        </p>
      </section>

      <footer className="mcp-page-foot">
        <p className="text-sm text-[var(--text-mute)]">
          Using Claude Code, Cursor CLI, or Codex?{" "}
          <button type="button" className="mcp-inline-link" onClick={() => setMode("cli")}>
            Switch to CLI setup
          </button>
        </p>
        <a
          href="https://github.com/semi-infiknight/khazakapi"
          target="_blank"
          rel="noopener noreferrer"
          className="mcp-github-link"
        >
          GitHub ↗
        </a>
      </footer>
    </div>
  );
}
