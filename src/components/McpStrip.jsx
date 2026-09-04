import { useMemo, useState } from "react";
import { PLATFORMS, mcpConnectorUrl } from "../data/mcpSetup.jsx";

export default function McpStrip() {
  const [platformId, setPlatformId] = useState("claude");
  const [copied, setCopied] = useState(false);

  const connectorUrl = useMemo(
    () => mcpConnectorUrl(typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );
  const platform = PLATFORMS.find((p) => p.id === platformId) || PLATFORMS[0];
  const config = platform.mcp;

  const connect = () => {
    if (config.step2Href) {
      window.open(config.step2Href, "_blank", "noopener,noreferrer");
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(connectorUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mcp-strip" aria-label="Connect to AI agent">
      <span className="mcp-strip-label">MCP</span>
      <select
        className="mcp-strip-select"
        value={platformId}
        onChange={(e) => setPlatformId(e.target.value)}
        aria-label="Select AI agent"
      >
        {PLATFORMS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <button type="button" className="mcp-strip-copy" onClick={copyUrl} title="Copy MCP URL">
        {copied ? "✓" : "⧉"}
      </button>
      <button type="button" className="mcp-strip-connect" onClick={connect}>
        <span className="mcp-strip-icon" aria-hidden="true">{platform.icon}</span>
        Add to {platform.label}
      </button>
    </div>
  );
}
