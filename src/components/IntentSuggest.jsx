import { useEffect, useState } from "react";
import IntentFlowsView from "./intent/IntentFlowsView.jsx";
import IntentTimelineView from "./intent/IntentTimelineView.jsx";
import IntentViewSwitcher from "./intent/IntentViewSwitcher.jsx";
import IntentZapierView from "./intent/IntentZapierView.jsx";
import { IntentRevealProvider, useIntentRevealState } from "./intent/intentReveal.jsx";
import {
  buildStackMermaid,
  featureBlocks,
  formatProductLabel,
  readStoredIntentView,
  INTENT_VIEW_STORAGE_KEY,
} from "./intent/intentShared.js";

export { buildStackMermaid, featureBlocks, formatProductLabel };

function IntentPromptHeader({ blocks, suggestion, view, onViewChange }) {
  const reveal = useIntentRevealState();
  const apiTotal = suggestion.total ?? blocks.reduce((n, b) => n + b.apis.length, 0);
  const revealedFeatures = blocks.filter((_, index) => reveal?.isVisible(`feature-${index}`)).length;
  const revealedApis = blocks.reduce((count, block, blockIndex) => {
    if (!reveal) return count;
    return (
      count +
      block.apis.filter((_, apiIndex) => reveal.isVisible(`api-${blockIndex}-${apiIndex}`)).length
    );
  }, 0);

  const featureLabel =
    reveal?.isGenerating && revealedFeatures < blocks.length
      ? `${revealedFeatures}/${blocks.length} features`
      : `${blocks.length} features`;
  const apiLabel =
    reveal?.isGenerating && revealedApis < apiTotal
      ? `${revealedApis}/${apiTotal} APIs`
      : `${apiTotal} APIs`;

  return (
    <header className="intent-prompt-head">
      <div>
        <p className="intent-prompt-role">
          {reveal?.isGenerating ? "Generating stack" : "Suggested stack"}
          {reveal?.isGenerating ? <span className="intent-generating-dot" aria-hidden="true" /> : null}
        </p>
        <p className="intent-prompt-meta">
          {featureLabel} · {apiLabel}
        </p>
      </div>
      <IntentViewSwitcher value={view} onChange={onViewChange} />
    </header>
  );
}

function IntentPromptShell({ blocks, suggestion, view, onViewChange, children }) {
  const reveal = useIntentRevealState();

  return (
    <article
      className={`panel intent-prompt${reveal?.isGenerating ? " is-generating" : ""}`}
      aria-label="Suggested API stack"
    >
      <IntentPromptHeader blocks={blocks} suggestion={suggestion} view={view} onViewChange={onViewChange} />
      {children}
    </article>
  );
}

function IntentResultsBody({ suggestion, onGeneratingChange }) {
  const [view, setView] = useState(readStoredIntentView);
  const blocks = featureBlocks(suggestion);

  useEffect(() => {
    window.localStorage.setItem(INTENT_VIEW_STORAGE_KEY, view);
  }, [view]);

  if (!suggestion?.query) return null;

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

  return (
    <IntentRevealProvider blocks={blocks} view={view} summary={suggestion.summary || ""} onGeneratingChange={onGeneratingChange}>
      <IntentPromptShell blocks={blocks} suggestion={suggestion} view={view} onViewChange={setView}>
        {view === "timeline" && (
          <div className="intent-view-pane" key="timeline">
            <IntentTimelineView suggestion={suggestion} blocks={blocks} />
          </div>
        )}

        {view === "flows" && (
          <div className="intent-view-pane" key="flows">
            <IntentFlowsView suggestion={suggestion} blocks={blocks} />
          </div>
        )}

        {view === "stack" && (
          <div className="intent-view-pane" key="stack">
            <IntentZapierView suggestion={suggestion} blocks={blocks} />
          </div>
        )}
      </IntentPromptShell>
    </IntentRevealProvider>
  );
}

export function IntentResults({ suggestion, onGeneratingChange }) {
  return <IntentResultsBody suggestion={suggestion} onGeneratingChange={onGeneratingChange} />;
}
