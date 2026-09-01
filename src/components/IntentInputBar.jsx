import { useEffect, useRef } from "react";

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13.5V2.5M8 2.5 4 6.5M8 2.5l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resizeField(node) {
  if (!node) return;
  node.style.height = "0";
  node.style.height = `${Math.min(node.scrollHeight, 120)}px`;
}

export default function IntentInputBar({
  value,
  onChange,
  onSubmit,
  submitting = false,
  placeholder = "Send a message…",
  variant = "default",
  inputRef,
}) {
  const fieldRef = useRef(null);
  const inline = variant === "inline";

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

  const hasValue = Boolean(value.trim());

  return (
    <form
      className={`ai-input ${inline ? "ai-input-inline" : ""} ${hasValue ? "ai-input-has-value" : ""} ${submitting ? "ai-input-submitting" : ""}`}
      onSubmit={submit}
    >
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
      <button
        type="submit"
        className="ai-input-send"
        disabled={!hasValue || submitting}
        aria-label={submitting ? "Finding APIs" : "Send"}
        tabIndex={hasValue ? 0 : -1}
      >
        {submitting ? <span className="ai-input-send-busy" aria-hidden="true" /> : <SendIcon />}
      </button>
    </form>
  );
}
