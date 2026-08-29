import { useEffect, useId, useRef, useState } from "react";
import ApiCard from "./ApiCard.jsx";

function shortApiLabel(title = "") {
  const base = title.split("~")[0].trim();
  return base.length > 26 ? `${base.slice(0, 24)}…` : base || "API";
}

function mermaidSafeId(value) {
  const id = String(value || "n")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return id || "n";
}

function escapeMermaidLabel(text) {
  return String(text || "")
    .replace(/"/g, "'")
    .replace(/[\[\]]/g, "")
    .replace(/\n/g, " ");
}

/** Build a left-to-right stack flowchart from matched intents. */
export function buildStackMermaid(suggestion) {
  const intents = suggestion?.intents || [];
  if (!intents.length) return "";

  const lines = [
    "flowchart LR",
    '  App["Your product"]',
    "  classDef app fill:#1a1030,stroke:#9c88fa,color:#f4f0ff,stroke-width:1.5px",
    "  classDef layer fill:#12101c,stroke:#5b4d8a,color:#e8e4f5,stroke-width:1px",
    "  classDef api fill:#0d1520,stroke:#3d5a80,color:#dce8f5,stroke-width:1px",
    "  class App app",
  ];

  intents.forEach((block, index) => {
    const layerId = `L_${mermaidSafeId(block.id)}`;
    const layerLabel = escapeMermaidLabel(block.label);
    lines.push(`  ${layerId}["${layerLabel}"]`);
    lines.push(`  class ${layerId} layer`);
    lines.push(`  App --> ${layerId}`);

    block.apis.slice(0, 4).forEach((api) => {
      const apiId = `A_${mermaidSafeId(api.id)}_${index}`;
      const apiLabel = escapeMermaidLabel(shortApiLabel(api.title));
      lines.push(`  ${apiId}["${apiLabel}"]`);
      lines.push(`  class ${apiId} api`);
      lines.push(`  ${layerId} --> ${apiId}`);
    });
  });

  return lines.join("\n");
}

function MermaidDiagram({ chart }) {
  const hostRef = useRef(null);
  const reactId = useId().replace(/:/g, "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    async function renderChart() {
      if (!chart || !hostRef.current) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "dark",
          flowchart: {
            curve: "basis",
            padding: 12,
            nodeSpacing: 28,
            rankSpacing: 40,
            htmlLabels: false,
          },
          themeVariables: {
            darkMode: true,
            background: "transparent",
            primaryColor: "#1a1030",
            primaryTextColor: "#f4f0ff",
            primaryBorderColor: "#9c88fa",
            lineColor: "#7a7199",
            secondaryColor: "#12101c",
            tertiaryColor: "#0d1520",
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            fontSize: "13px",
          },
        });

        const id = `stack-${reactId}-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && hostRef.current) {
          hostRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setFailed(true);
      }
    }

    renderChart();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (!chart) return null;

  if (failed) {
    return (
      <pre className="intent-prompt-mermaid-fallback">
        <code>{chart}</code>
      </pre>
    );
  }

  return <div ref={hostRef} className="intent-prompt-mermaid" aria-label="Suggested API stack diagram" />;
}

function explainApi(api) {
  if (api.plugIn?.auth) return api.plugIn.auth;
  if (api.auth === "none") return "No authentication required — call it directly from your backend.";
  if (api.auth === "apiKey") return `Get an API key from ${api.provider}, keep it server-side, then call this endpoint.`;
  if (api.auth === "oauth") return `Complete OAuth with ${api.provider}, then call with a bearer token.`;
  return `Wire this into your flow via ${api.provider}.`;
}

function PromptApiBlock({ api }) {
  return (
    <div className="intent-prompt-api">
      <ApiCard api={api} />
      <p className="intent-prompt-api-note">{explainApi(api)}</p>
    </div>
  );
}

export function IntentResults({ suggestion }) {
  if (!suggestion?.query) return null;

  if (suggestion.fit === false || (!suggestion?.intents?.length && !suggestion?.apis?.length)) {
    return (
      <div className="panel intent-prompt intent-prompt--empty">
        <header className="intent-prompt-head">
          <span className="intent-prompt-role">assistant</span>
          <span className="intent-prompt-meta">no fit</span>
        </header>
        <p className="intent-prompt-body">
          {suggestion.summary ||
            `We don’t have a good API fit for “${suggestion.query}” in the Kazakhstan catalogue.`}
        </p>
        <p className="intent-prompt-quote">
          Prompt: <span>&ldquo;{suggestion.query}&rdquo;</span>
        </p>
        <p className="intent-prompt-nofit-hint">
          This directory covers KZ payments, maps, delivery, banking, travel, weather, telecom, and government open
          data — not every product idea worldwide.
        </p>
      </div>
    );
  }

  const chart = buildStackMermaid(suggestion);

  return (
    <article className="panel intent-prompt" aria-label="Suggested API stack">
      <header className="intent-prompt-head">
        <span className="intent-prompt-role">assistant</span>
        <span className="intent-prompt-meta">
          {suggestion.total} API{suggestion.total === 1 ? "" : "s"} · {suggestion.intents.length} layer
          {suggestion.intents.length === 1 ? "" : "s"}
          {suggestion.bestScore != null ? ` · score ${Number(suggestion.bestScore).toFixed(2)}` : ""}
        </span>
      </header>

      <p className="intent-prompt-body">{suggestion.summary}</p>

      {suggestion.query && (
        <p className="intent-prompt-quote">
          Prompt: <span>&ldquo;{suggestion.query}&rdquo;</span>
        </p>
      )}

      <section className="intent-prompt-diagram" aria-label="Architecture diagram">
        <h3 className="intent-prompt-section-label">Stack diagram</h3>
        <MermaidDiagram chart={chart} />
      </section>

      {suggestion.intents.map((block) => (
        <section key={block.id} className="intent-prompt-layer">
          <h3 className="intent-prompt-layer-title">{block.label}</h3>
          <p className="intent-prompt-layer-where">{block.where}</p>
          <div className="intent-prompt-api-grid">
            {block.apis.map((api) => (
              <PromptApiBlock key={`${block.id}-${api.id}`} api={api} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
