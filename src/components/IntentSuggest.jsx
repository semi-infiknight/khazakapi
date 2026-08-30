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

function featureBlocks(suggestion) {
  return suggestion?.features?.length ? suggestion.features : suggestion?.intents || [];
}

/** Build a left-to-right stack flowchart from matched features. */
export function buildStackMermaid(suggestion) {
  const blocks = featureBlocks(suggestion);
  if (!blocks.length) return "";

  const lines = [
    "flowchart LR",
    '  App["Your product"]',
    "  classDef app fill:#1a1030,stroke:#9c88fa,color:#f4f0ff,stroke-width:1.5px",
    "  classDef layer fill:#12101c,stroke:#5b4d8a,color:#e8e4f5,stroke-width:1px",
    "  classDef api fill:#0d1520,stroke:#3d5a80,color:#dce8f5,stroke-width:1px",
    "  class App app",
  ];

  blocks.forEach((block, index) => {
    const layerId = `F_${mermaidSafeId(block.id)}`;
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

function FeatureApiCard({ api, feature }) {
  const showApiContext =
    api.plugIn?.why &&
    (api.plugIn.why !== feature.why || api.plugIn.where !== feature.where);

  return (
    <div className="intent-feature-api">
      <ApiCard api={api} />
      {showApiContext && (
        <p className="intent-feature-api-note">
          <span className="intent-feature-api-note-label">Why</span> {api.plugIn.why}
          {api.plugIn.where ? (
            <>
              {" "}
              <span className="intent-feature-api-note-label">Where</span> {api.plugIn.where}
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}

export function IntentResults({ suggestion }) {
  if (!suggestion?.query) return null;

  const blocks = featureBlocks(suggestion);

  if (suggestion.fit === false || (!blocks.length && !suggestion?.apis?.length)) {
    return (
      <div className="panel intent-prompt intent-prompt--empty">
        <p className="intent-prompt-body">
          {suggestion.summary ||
            `We don’t have a good API fit for “${suggestion.query}” in the Kazakhstan catalogue.`}
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
      <section className="intent-prompt-diagram" aria-label="Architecture diagram">
        <MermaidDiagram chart={chart} />
      </section>

      {blocks.map((block) => (
        <section key={block.id} className="intent-prompt-layer intent-feature-block">
          <h3 className="intent-prompt-layer-title">
            {block.parentLabel ? (
              <>
                <span className="intent-feature-parent">{block.parentLabel}</span>
                <span className="intent-feature-sep"> / </span>
              </>
            ) : null}
            {block.label}
          </h3>
          {block.why ? (
            <p className="intent-feature-why">
              <span className="intent-feature-label">Why</span> {block.why}
            </p>
          ) : null}
          {block.where ? (
            <p className="intent-feature-where">
              <span className="intent-feature-label">Where</span> {block.where}
            </p>
          ) : null}
          <div className="intent-prompt-api-grid">
            {block.apis.map((api) => (
              <FeatureApiCard key={`${block.id}-${api.id}`} api={api} feature={block} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
