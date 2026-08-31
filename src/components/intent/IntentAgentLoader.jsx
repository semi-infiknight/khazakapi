import { useEffect, useMemo, useState } from "react";
import { formatProductLabel } from "./intentShared.js";

const STEP_ADVANCE_MS = 850;
const THOUGHT_CYCLE_MS = 2200;

function buildAgentSteps(query) {
  const productLabel = formatProductLabel(query);

  return [
    {
      id: "intent",
      title: "Understanding intent",
      quote: productLabel,
      thoughts: ["Reading your product description…"],
    },
    {
      id: "features",
      title: "Extracting features",
      thoughts: [
        "Mapping capabilities to the KZ feature ontology…",
        "Matching recipes for payments, maps, delivery, gov data…",
        "Ranking feature signals from your prompt…",
      ],
    },
    {
      id: "catalogue",
      title: "Scanning catalogue",
      thoughts: [
        "Searching 688 Kazakhstan APIs…",
        "Filtering commercial and government providers…",
        "Loading semantic matches across the directory…",
      ],
    },
    {
      id: "match",
      title: "Matching APIs",
      thoughts: [
        "Scoring Kaspi, 2GIS, Yandex, NBK, and gov open data…",
        "Checking capability overlap per feature…",
        "Keeping only strong KZ catalogue fits…",
      ],
    },
    {
      id: "stack",
      title: "Assembling stack",
      thoughts: [
        "Grouping APIs into feature paths…",
        "Preparing Timeline, Flows, and Stack views…",
        "Almost ready…",
      ],
    },
  ];
}

function stepStatus(index, activeIndex) {
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "pending";
}

function AgentStep({ step, index, status, thoughtIndex, isLast }) {
  const thoughts = step.thoughts || [];
  const activeThought = thoughts[thoughtIndex % Math.max(thoughts.length, 1)] || "";
  const doneThought = thoughts[thoughts.length - 1] || activeThought;

  return (
    <li
      className={`integration-step integration-step--${status}`}
      style={{ "--step-i": index }}
      aria-current={status === "active" ? "step" : undefined}
    >
      <div className="integration-step-rail" aria-hidden="true">
        <span className="integration-step-dot">
          {status === "done" ? "✓" : index + 1}
        </span>
        {!isLast ? <span className="integration-step-line" /> : null}
      </div>

      <div className="integration-step-body">
        <p className="integration-step-title">{step.title}</p>

        {step.quote ? (
          <p className="integration-step-quote">
            <span>{step.quote}</span>
          </p>
        ) : null}

        {status === "active" && activeThought ? (
          <p className="integration-step-thought integration-step-thought--live">
            {activeThought}
            <span className="agent-thought-cursor" aria-hidden="true" />
          </p>
        ) : null}

        {status === "done" && !step.quote && doneThought ? (
          <p className="integration-step-thought">{doneThought}</p>
        ) : null}
      </div>
    </li>
  );
}

export default function IntentAgentLoader({ query, loading = true }) {
  const steps = useMemo(() => buildAgentSteps(query), [query]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thoughtIndex, setThoughtIndex] = useState(0);

  useEffect(() => {
    if (!loading) return undefined;
    setActiveIndex(0);
    setThoughtIndex(0);
    return undefined;
  }, [query, loading]);

  useEffect(() => {
    if (!loading) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => Math.min(current + 1, steps.length - 1));
    }, STEP_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [loading, steps.length]);

  useEffect(() => {
    if (!loading) return undefined;

    const timer = window.setInterval(() => {
      setThoughtIndex((current) => current + 1);
    }, THOUGHT_CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [loading, activeIndex]);

  return (
    <div
      className="panel integration-chain integration-chain--loading intent-agent-loader"
      role="status"
      aria-live="polite"
      aria-busy={loading ? "true" : "false"}
      aria-label="Analyzing your product intent"
    >
      <header className="integration-chain-head">
        <div className="intent-agent-loader-head">
          <span className="integration-chain-label">Agent working</span>
          <span className="agent-status-pill">
            <span className="agent-status-dot" aria-hidden="true" />
            Live
          </span>
        </div>
        <span className="integration-chain-meta">
          Step {activeIndex + 1} / {steps.length}
        </span>
      </header>

      <ol className="integration-chain-list">
        {steps.map((step, index) => {
          const status = stepStatus(index, activeIndex);
          const visible = status !== "pending" || index === activeIndex + 1;
          if (!visible && status === "pending") return null;

          return (
            <AgentStep
              key={step.id}
              step={step}
              index={index}
              status={status}
              thoughtIndex={thoughtIndex}
              isLast={index === steps.length - 1}
            />
          );
        })}
      </ol>
    </div>
  );
}

export function AgentSubmitSpinner({ label = "Analyzing" }) {
  return (
    <span className="agent-submit-spinner" aria-hidden="true">
      <span className="agent-submit-spinner-orbit" />
      <span className="agent-submit-spinner-core" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
