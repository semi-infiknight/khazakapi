import { AgentSubmitSpinner } from "./IntentAgentLoader.jsx";

const SKELETON_ROWS = 3;

export default function CatalogueAgentLoader() {
  return (
    <div className="catalogue-agent-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="catalogue-agent-loader-head">
        <AgentSubmitSpinner label="Loading catalogue" />
        <div>
          <p className="catalogue-agent-loader-title">Loading Kazakhstan API catalogue</p>
          <p className="catalogue-agent-loader-meta">Indexing providers, endpoints, and capabilities…</p>
        </div>
      </div>

      <div className="catalogue-agent-skeleton" aria-hidden="true">
        {Array.from({ length: SKELETON_ROWS }, (_, row) => (
          <div key={row} className="catalogue-agent-skeleton-row">
            {Array.from({ length: 4 }, (__, col) => (
              <span
                key={col}
                className="catalogue-agent-skeleton-card"
                style={{ "--sk-i": row * 4 + col }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
