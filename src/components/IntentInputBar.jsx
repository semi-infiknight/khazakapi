import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const QUICK_PROMPTS = [
  { label: "Quick commerce", value: "Quick commerce app with Kaspi checkout and courier delivery" },
  { label: "Payments", value: "Kaspi Pay, Halyk, and NBK exchange rates" },
  { label: "Maps & delivery", value: "2GIS geocoding, routing, and last-mile delivery APIs" },
  { label: "Gov data", value: "data.egov.kz open data and eGov integrations" },
];

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 15.5V3.5M9 3.5 4.5 8M9 3.5l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KeysIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M6.5 8.5a3.5 3.5 0 1 1 2.5 5.9L4 15.9l-1.9-.6-.6-1.9 1.5-4.9A3.5 3.5 0 0 1 6.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2 14 5.5v5L8 14 2 10.5v-5L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 8 14 5.5M8 8 2 5.5M8 8v6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 8h11M8 2.5c1.8 1.6 2.8 3.8 2.8 5.5S9.8 11.9 8 13.5c-1.8-1.6-2.8-3.8-2.8-5.5S6.2 4.1 8 2.5Z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function resizeField(node) {
  if (!node) return;
  node.style.height = "0";
  node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
}

export default function IntentInputBar({
  value,
  onChange,
  onSubmit,
  submitting = false,
  placeholder = "Describe what you're building — Kaspi checkout, 2GIS maps, courier ETA…",
  hint,
  variant = "default",
  inputRef,
}) {
  const fieldRef = useRef(null);
  const compact = variant === "inline";

  useEffect(() => {
    resizeField(fieldRef.current);
  }, [value]);

  const setFieldRef = (node) => {
    fieldRef.current = node;
    if (!inputRef) return;
    if (typeof inputRef === "function") inputRef(node);
    else inputRef.current = node;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!value.trim() || submitting) return;
    onSubmit();
  };

  const field = (
    <textarea
      ref={setFieldRef}
      className="ai-input-field"
      rows={1}
      value={value}
      placeholder={placeholder}
      aria-label="Describe your app or features"
      disabled={submitting}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (value.trim() && !submitting) onSubmit();
        }
      }}
    />
  );

  const sendButton = (
    <button
      type="submit"
      className="ai-input-send"
      disabled={!value.trim() || submitting}
      aria-label={submitting ? "Finding APIs" : "Build stack"}
    >
      {submitting ? <span className="ai-input-send-busy" aria-hidden="true" /> : <SendIcon />}
    </button>
  );

  if (compact) {
    return (
      <form className="ai-input ai-input-inline" onSubmit={submit}>
        <div className="ai-input-shell ai-input-shell-inline">
          {field}
          <div className="ai-input-actions">{sendButton}</div>
        </div>
      </form>
    );
  }

  return (
    <div className="ai-input">
      {!compact && (
        <div className="ai-input-modes" aria-label="Search context">
          <span className="ai-input-mode ai-input-mode-active">
            <StackIcon />
            Qazaq Stack
          </span>
          <span className="ai-input-mode">
            <GlobeIcon />
            688 KZ endpoints
          </span>
        </div>
      )}

      <form className="ai-input-shell" onSubmit={submit}>
        {field}

        <div className="ai-input-toolbar">
          <div className="ai-input-chips">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.label}
                type="button"
                className="ai-input-chip"
                disabled={submitting}
                onClick={() => onChange(prompt.value)}
              >
                {prompt.label}
              </button>
            ))}
          </div>

          <div className="ai-input-actions">
            <Link to="/keys" className="ai-input-action" aria-label="API keys" title="API keys">
              <KeysIcon />
            </Link>
            {sendButton}
          </div>
        </div>
      </form>

      {hint ? <p className="ai-input-hint">{hint}</p> : null}
    </div>
  );
}
