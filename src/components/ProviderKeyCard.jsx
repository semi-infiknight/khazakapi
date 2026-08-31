import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  clearProviderKey,
  getProviderKey,
  getProviderKeyMeta,
  maskKey,
  providerInfo,
  saveProviderKey,
} from "../lib/providerKeys.js";
import { validateDataEgovKey } from "../lib/api.js";

export default function ProviderKeyCard({ providerId, compact = false, focused = false, onKeyChange }) {
  const info = providerInfo(providerId);
  const inputId = useId();
  const [savedKey, setSavedKey] = useState(() => getProviderKey(providerId));
  const [savedMeta, setSavedMeta] = useState(() => getProviderKeyMeta(providerId));
  const [draft, setDraft] = useState("");
  const [showDraft, setShowDraft] = useState(false);
  const [validating, setValidating] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const sync = () => {
      const key = getProviderKey(providerId);
      setSavedKey(key);
      setSavedMeta(getProviderKeyMeta(providerId));
      onKeyChange?.(key);
    };
    window.addEventListener("khazak:provider-key", sync);
    return () => window.removeEventListener("khazak:provider-key", sync);
  }, [providerId, onKeyChange]);

  useEffect(() => {
    onKeyChange?.(savedKey);
  }, [savedKey, onKeyChange]);

  const saveKey = async () => {
    const key = draft.trim();
    if (!key) {
      setStatus({ tone: "error", text: `Paste your ${info.credentialLabel || "credential"} first.` });
      return;
    }

    setValidating(true);
    setStatus(null);
    try {
      if (info.validate === "data-egov") {
        const result = await validateDataEgovKey(key);
        if (!result.valid) {
          setStatus({ tone: "error", text: result.error || "Key validation failed." });
          return;
        }
        const meta = saveProviderKey(providerId, key, { validated: true });
        setSavedKey(key);
        setSavedMeta(meta);
        setDraft("");
        setShowDraft(false);
        setStatus({ tone: "ok", text: result.message || "Key saved in this browser." });
        onKeyChange?.(key);
        return;
      }

      const meta = saveProviderKey(providerId, key, { validated: false });
      setSavedKey(key);
      setSavedMeta(meta);
      setDraft("");
      setShowDraft(false);
      setStatus({ tone: "ok", text: "Saved locally in this browser." });
      onKeyChange?.(key);
    } catch (e) {
      setStatus({ tone: "error", text: e.message });
    } finally {
      setValidating(false);
    }
  };

  const removeKey = () => {
    clearProviderKey(providerId);
    setSavedKey("");
    setSavedMeta(null);
    setDraft("");
    setShowDraft(false);
    setStatus({ tone: "ok", text: "Removed from this browser." });
    onKeyChange?.("");
  };

  const cardClass = [
    "keys-card",
    compact ? "keys-card-compact" : "",
    focused ? "keys-card-focused" : "",
    savedKey ? "keys-card-saved" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass} id={`key-${providerId}`}>
      <div className="keys-card-head">
        <div className="keys-card-title-wrap">
          <h3 className="keys-card-title">{info.label}</h3>
          <p className="keys-card-desc">{info.description}</p>
        </div>
        <span className={`keys-status ${savedKey ? "keys-status-saved" : "keys-status-empty"}`}>
          {savedKey ? "Saved" : "Not set"}
        </span>
      </div>

      {savedKey && !showDraft ? (
        <div className="keys-saved-block">
          <div>
            <p className="keys-field-label">{info.credentialLabel || "Credential"}</p>
            <p className="keys-mask">{maskKey(savedKey)}</p>
            {savedMeta?.savedAt && (
              <p className="keys-meta">
                Saved {new Date(savedMeta.savedAt).toLocaleString()}
                {savedMeta.validated ? " · validated" : ""}
              </p>
            )}
          </div>
          <div className="keys-actions">
            <button type="button" className="btn-metal keys-btn" onClick={() => setShowDraft(true)}>
              Replace
            </button>
            <button type="button" className="btn-metal keys-btn keys-btn-ghost" onClick={removeKey}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="keys-form">
          <label className="keys-field" htmlFor={inputId}>
            <span className="keys-field-label">{info.credentialLabel || "Credential"}</span>
            <input
              id={inputId}
              type="password"
              autoComplete="off"
              placeholder={`Paste ${info.label} credential`}
              className="keys-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <div className="keys-actions">
            <button type="button" className="btn-metal keys-btn" onClick={saveKey} disabled={validating}>
              {validating ? "Saving…" : info.validate === "data-egov" ? "Validate & save" : "Save locally"}
            </button>
            {showDraft && savedKey && (
              <button
                type="button"
                className="btn-metal keys-btn keys-btn-ghost"
                onClick={() => {
                  setShowDraft(false);
                  setDraft("");
                  setStatus(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {status && (
        <p className={`keys-status-msg ${status.tone === "ok" ? "keys-status-msg-ok" : "keys-status-msg-error"}`}>
          {status.text}
        </p>
      )}

      {info.links?.length > 0 && (
        <div className="keys-links">
          {info.links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="keys-link">
              {link.label} ↗
            </a>
          ))}
        </div>
      )}

      {compact && (
        <Link to="/keys" className="keys-manage-link">
          Open key manager →
        </Link>
      )}
    </article>
  );
}
