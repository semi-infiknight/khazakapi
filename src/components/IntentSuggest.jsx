import { useEffect, useState } from "react";
import ApiCard from "./ApiCard.jsx";

function shortApiLabel(title = "") {
  const base = title.split("~")[0].trim();
  return base.length > 36 ? `${base.slice(0, 34)}…` : base || "API";
}

function explainApi(api) {
  if (api.plugIn?.where) return api.plugIn.where;
  if (api.plugIn?.auth) return api.plugIn.auth;
  if (api.auth === "none") return "Call directly from your backend — no API key.";
  if (api.auth === "apiKey") return `Get an API key from ${api.provider} and call server-side.`;
  if (api.auth === "oauth") return `OAuth with ${api.provider}, then call with a bearer token.`;
  return `Integrate via ${api.provider}.`;
}

function ChainStep({ index, title, status = "done", children, isLast = false }) {
  return (
    <li className={`integration-step integration-step--${status}`} style={{ "--step-i": index }}>
      <div className="integration-step-rail" aria-hidden="true">
        <span className="integration-step-dot">{index}</span>
        {!isLast && <span className="integration-step-line" />}
      </div>
      <div className="integration-step-body">
        {title ? <h3 className="integration-step-title">{title}</h3> : null}
        {children}
      </div>
    </li>
  );
}

export function IntegrationChainLoading({ query }) {
  const phases = [
    "Reading your product description",
    "Matching Kazakhstan APIs in the catalogue",
    "Building your integration chain",
  ];
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 900),
      window.setTimeout(() => setPhase(2), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <article className="panel integration-chain integration-chain--loading" aria-busy="true" aria-live="polite">
      <header className="integration-chain-head">
        <span className="integration-chain-label">Integration chain</span>
        <span className="integration-chain-meta">analyzing…</span>
      </header>

      <ol className="integration-chain-list">
        <ChainStep index={1} title="Your product" status="done">
          <p className="integration-step-quote">&ldquo;{query}&rdquo;</p>
        </ChainStep>

        {phases.map((label, i) => {
          const status = i < phase ? "done" : i === phase ? "active" : "pending";
          return (
            <ChainStep key={label} index={i + 2} title={label} status={status} isLast={i === phases.length - 1}>
              <p className="integration-step-thought">
                {status === "active" ? "…" : status === "done" ? "Done" : "Waiting"}
              </p>
            </ChainStep>
          );
        })}
      </ol>
    </article>
  );
}

export function IntegrationChain({ suggestion }) {
  const [revealed, setRevealed] = useState(0);
  const fit = suggestion?.fit !== false && (suggestion?.intents?.length || suggestion?.apis?.length);
  const steps = fit
    ? (suggestion.intents || []).flatMap((block, blockIndex) =>
        block.apis.map((api, apiIndex) => ({
          key: `${block.id}-${api.id}`,
          stepIndex: blockIndex + 3 + apiIndex,
          block,
          api,
          showBlockHeader: apiIndex === 0,
        })),
      )
    : [];

  const totalSteps = fit ? 2 + steps.length : 3;

  useEffect(() => {
    setRevealed(0);
    const timers = [];
    for (let i = 0; i <= totalSteps; i++) {
      timers.push(window.setTimeout(() => setRevealed(i), 120 + i * 180));
    }
    return () => timers.forEach(clearTimeout);
  }, [suggestion?.query, totalSteps]);

  if (!suggestion?.query) return null;

  if (!fit) {
    return (
      <article className="panel integration-chain" aria-label="Integration analysis">
        <header className="integration-chain-head">
          <span className="integration-chain-label">Integration chain</span>
          <span className="integration-chain-meta">
            no match{suggestion.summarySource === "llm" ? " · ai" : ""}
          </span>
        </header>

        <ol className="integration-chain-list">
          <ChainStep index={1} title="Your product" status={revealed >= 1 ? "done" : "pending"}>
            <p className="integration-step-quote">&ldquo;{suggestion.query}&rdquo;</p>
          </ChainStep>

          <ChainStep
            index={2}
            title="Catalogue check"
            status={revealed >= 2 ? "done" : revealed === 1 ? "active" : "pending"}
            isLast={revealed < 3}
          >
            <p className="integration-step-thought">
              {suggestion.summary ||
                `No strong API match in the Kazakhstan catalogue (similarity ${Number(suggestion.bestScore || 0).toFixed(2)}).`}
            </p>
          </ChainStep>

          <ChainStep
            index={3}
            title="What we do cover"
            status={revealed >= 3 ? "done" : revealed === 2 ? "active" : "pending"}
            isLast
          >
            <p className="integration-step-thought">
              KhazakAPI focuses on KZ payments, maps, delivery, banking, travel, weather, telecom, and government
              open data — not every product idea worldwide.
            </p>
          </ChainStep>
        </ol>
      </article>
    );
  }

  return (
    <article className="panel integration-chain" aria-label="Suggested API integration chain">
      <header className="integration-chain-head">
        <span className="integration-chain-label">Integration chain</span>
        <span className="integration-chain-meta">
          {steps.length} connection{steps.length === 1 ? "" : "s"}
          {suggestion.summarySource === "llm" ? " · ai" : ""}
        </span>
      </header>

      <ol className="integration-chain-list">
        <ChainStep index={1} title="Your product" status={revealed >= 1 ? "done" : "pending"}>
          <p className="integration-step-quote">&ldquo;{suggestion.query}&rdquo;</p>
        </ChainStep>

        <ChainStep
          index={2}
          title="Integration plan"
          status={revealed >= 2 ? "done" : revealed === 1 ? "active" : "pending"}
          isLast={revealed < 3 && steps.length === 0}
        >
          <p className="integration-step-thought">{suggestion.summary}</p>
        </ChainStep>

        {steps.map(({ key, stepIndex, block, api, showBlockHeader }, i) => {
          const status =
            revealed >= stepIndex ? "done" : revealed === stepIndex - 1 ? "active" : "pending";
          const isLast = i === steps.length - 1;

          return (
            <ChainStep
              key={key}
              index={stepIndex}
              title={showBlockHeader ? block.label : null}
              status={status}
              isLast={isLast}
            >
              {showBlockHeader && (
                <p className="integration-step-phase">
                  <span className="integration-step-phase-label">When</span>
                  {block.where}
                </p>
              )}
              <div className="integration-step-connect">
                <span className="integration-step-connect-label">Connect</span>
                <div className="integration-step-api">
                  <ApiCard api={api} />
                  <p className="integration-step-api-note">
                    <strong>{shortApiLabel(api.title)}</strong> — {explainApi(api)}
                  </p>
                </div>
              </div>
            </ChainStep>
          );
        })}
      </ol>
    </article>
  );
}

/** @deprecated use IntegrationChain */
export function IntentResults(props) {
  return <IntegrationChain {...props} />;
}
