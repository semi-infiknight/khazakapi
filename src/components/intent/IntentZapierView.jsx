import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ApiLogo from "../ApiLogo.jsx";
import { shortApiLabel } from "./intentShared.js";

function ZapierConnector() {
  return (
    <div className="intent-zapier-connector" aria-hidden="true">
      <span className="intent-zapier-connector-line" />
      <span className="intent-zapier-connector-plus">+</span>
    </div>
  );
}

function apiHref(api) {
  return (
    api.plugIn?.href ||
    api.hubPath ||
    (api.companyHub && api.categorySlug && api.companySlug
      ? `/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`
      : `/apis/${api.slug || api.id}`)
  );
}

function buildSteps(suggestion, blocks) {
  const steps = [
    {
      id: "trigger",
      kind: "trigger",
      title: "Your product",
      meta: suggestion.query,
      detail: suggestion.summary,
      apis: [],
    },
  ];

  blocks.forEach((block) => {
    steps.push({
      id: block.id,
      kind: "feature",
      title: block.label,
      meta: block.parentLabel,
      detail: block.why,
      where: block.where,
      apis: block.apis,
    });
  });

  return steps;
}

function ZapierStepCard({ step, active, onSelect }) {
  return (
    <button
      type="button"
      className={`intent-zapier-step ${active ? "intent-zapier-step-active" : ""} intent-zapier-step--${step.kind}`}
      onClick={() => onSelect(step.id)}
      aria-pressed={active}
    >
      <span className="intent-zapier-step-icon">{step.kind === "trigger" ? "⚡" : "▣"}</span>
      <span className="intent-zapier-step-copy">
        <span className="intent-zapier-step-kind">{step.kind === "trigger" ? "Trigger" : "Action"}</span>
        <strong className="intent-zapier-step-title">{step.title}</strong>
        {step.meta ? <span className="intent-zapier-step-meta">{step.meta}</span> : null}
      </span>
      {step.apis.length > 0 && (
        <span className="intent-zapier-step-count">{step.apis.length} APIs</span>
      )}
    </button>
  );
}

export default function IntentZapierView({ suggestion, blocks }) {
  const steps = useMemo(() => buildSteps(suggestion, blocks), [suggestion, blocks]);
  const [selectedId, setSelectedId] = useState(steps[0]?.id || "trigger");
  const selected = steps.find((s) => s.id === selectedId) || steps[0];

  return (
    <div className="intent-zapier">
      <div className="intent-zapier-toolbar">
        <span className="intent-zapier-toolbar-label">Zapier-style stack</span>
        <span className="intent-zapier-toolbar-meta">{steps.length - 1} actions</span>
      </div>

      <div className="intent-zapier-shell">
        <div className="intent-zapier-canvas" aria-label="Automation flow canvas">
          {steps.map((step, index) => (
            <div key={step.id} className="intent-zapier-step-wrap">
              <ZapierStepCard step={step} active={selectedId === step.id} onSelect={setSelectedId} />
              {step.apis.length > 0 && (
                <div className="intent-zapier-substeps">
                  {step.apis.map((api) => (
                    <Link key={api.id} to={apiHref(api)} className="intent-zapier-substep">
                      <ApiLogo api={api} />
                      <span className="intent-zapier-substep-copy">
                        <strong>{shortApiLabel(api.title)}</strong>
                        <span>{api.provider || api.companyName}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {index < steps.length - 1 ? <ZapierConnector /> : null}
            </div>
          ))}
        </div>

        <aside className="intent-zapier-inspector panel" aria-label="Step details">
          <p className="intent-zapier-inspector-kicker">
            {selected?.kind === "trigger" ? "Trigger" : "Action"} details
          </p>
          <h3 className="intent-zapier-inspector-title">{selected?.title}</h3>
          {selected?.detail ? <p className="intent-zapier-inspector-body">{selected.detail}</p> : null}
          {selected?.where ? (
            <p className="intent-zapier-inspector-body">
              <span className="intent-feature-label">Where</span> {selected.where}
            </p>
          ) : null}
          {selected?.apis?.length ? (
            <ul className="intent-zapier-inspector-list">
              {selected.apis.map((api) => (
                <li key={api.id}>
                  <Link to={apiHref(api)} className="intent-zapier-inspector-link">
                    {shortApiLabel(api.title)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
