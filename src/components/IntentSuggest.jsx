import { useEffect, useState } from "react";
import IntentFlowsView from "./intent/IntentFlowsView.jsx";
import IntentTimelineView from "./intent/IntentTimelineView.jsx";
import IntentViewSwitcher from "./intent/IntentViewSwitcher.jsx";
import IntentZapierView from "./intent/IntentZapierView.jsx";
import {
  buildStackMermaid,
  featureBlocks,
  formatProductLabel,
  readStoredIntentView,
  INTENT_VIEW_STORAGE_KEY,
} from "./intent/intentShared.js";

export { buildStackMermaid, featureBlocks, formatProductLabel };

export function IntentResults({ suggestion }) {
  const [view, setView] = useState(readStoredIntentView);

  useEffect(() => {
    window.localStorage.setItem(INTENT_VIEW_STORAGE_KEY, view);
  }, [view]);

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

  return (
    <article className="panel intent-prompt" aria-label="Suggested API stack">
      <header className="intent-prompt-head">
        <div>
          <p className="intent-prompt-role">Suggested stack</p>
          <p className="intent-prompt-meta">{blocks.length} features · {suggestion.total ?? blocks.reduce((n, b) => n + b.apis.length, 0)} APIs</p>
        </div>
        <IntentViewSwitcher value={view} onChange={setView} />
      </header>

      {view === "timeline" && <IntentTimelineView suggestion={suggestion} blocks={blocks} />}

      {view === "flows" && <IntentFlowsView suggestion={suggestion} blocks={blocks} />}

      {view === "stack" && <IntentZapierView suggestion={suggestion} blocks={blocks} />}
    </article>
  );
}
