import { INTENT_VIEW_MODES } from "./intentShared.js";

export default function IntentViewSwitcher({ value, onChange }) {
  return (
    <div className="intent-view-switcher" role="tablist" aria-label="Stack visualization view">
      {INTENT_VIEW_MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={value === mode.id}
          className={`intent-view-switcher-btn ${value === mode.id ? "intent-view-switcher-btn-active" : ""}`}
          onClick={() => onChange(mode.id)}
          title={mode.hint}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
