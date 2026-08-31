import FeatureApiCard from "./FeatureApiCard.jsx";
import MermaidDiagram from "./MermaidDiagram.jsx";
import { buildStackMermaid, formatProductLabel } from "./intentShared.js";
import { useMobileLayout } from "../../hooks/useMediaQuery.js";

function FeatureStepTitle({ block }) {
  return (
    <h3 className="intent-timeline-step-title">
      {block.parentLabel ? (
        <>
          <span className="intent-feature-parent">{block.parentLabel}</span>
          <span className="intent-feature-sep"> / </span>
        </>
      ) : null}
      {block.label}
    </h3>
  );
}

function FeatureStepMeta({ block }) {
  return (
    <>
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
    </>
  );
}

export default function IntentTimelineView({ suggestion, blocks }) {
  const isMobile = useMobileLayout();
  const chart = buildStackMermaid(suggestion, { direction: isMobile ? "TB" : "LR" });
  const productLabel = formatProductLabel(suggestion?.query);

  return (
    <>
      <section className="intent-prompt-diagram" aria-label="Architecture diagram">
        <MermaidDiagram chart={chart} />
      </section>

      <ol className="intent-timeline-list">
        <li className="intent-timeline-step">
          <div className="intent-timeline-rail" aria-hidden="true">
            <span className="intent-timeline-marker intent-timeline-marker--app">0</span>
            <span className="intent-timeline-line" />
          </div>
          <div className="intent-timeline-panel">
            <p className="intent-timeline-kicker">{productLabel}</p>
            {suggestion.summary ? <p className="intent-timeline-summary">{suggestion.summary}</p> : null}
          </div>
        </li>

        {blocks.map((block, index) => (
          <li key={block.id} className="intent-timeline-step">
            <div className="intent-timeline-rail" aria-hidden="true">
              <span className="intent-timeline-marker">{index + 1}</span>
              {index < blocks.length - 1 ? <span className="intent-timeline-line" /> : null}
            </div>
            <div className="intent-timeline-panel intent-timeline-panel--feature">
              <FeatureStepTitle block={block} />
              <FeatureStepMeta block={block} />
              <div className="intent-prompt-api-grid">
                {block.apis.map((api) => (
                  <FeatureApiCard key={`${block.id}-${api.id}`} api={api} feature={block} />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
