import { useEffect, useState } from "react";
import {
  clearProviderKey,
  getProviderKey,
  getProviderKeyMeta,
  saveProviderKey,
} from "../lib/providerKeys.js";
import { validateDataEgovKey } from "../lib/api.js";

const PROVIDER_ID = "data.egov.kz";

const LINKS = {
  register: "https://idp.egov.kz/idp/register.jsp",
  login: "https://data.egov.kz/security/loginwithproposalmodal",
  cabinet: "https://data.egov.kz/profile/apikeylist",
  samples: "https://data.egov.kz/pages/samples",
  portal: "https://data.egov.kz/",
};

function Step({ n, title, children }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--code-bg)]/40 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">Step {n}</p>
      <h3 className="mt-1 text-sm font-semibold">{title}</h3>
      <div className="mt-2 text-sm text-[var(--text-soft)]">{children}</div>
    </div>
  );
}

export default function EgovKeySetup({ compact = false, onKeyChange }) {
  const [savedKey, setSavedKey] = useState(() => getProviderKey(PROVIDER_ID));
  const [savedMeta, setSavedMeta] = useState(() => getProviderKeyMeta(PROVIDER_ID));
  const [draft, setDraft] = useState("");
  const [validating, setValidating] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const sync = () => {
      const key = getProviderKey(PROVIDER_ID);
      setSavedKey(key);
      setSavedMeta(getProviderKeyMeta(PROVIDER_ID));
      onKeyChange?.(key);
    };
    window.addEventListener("khazak:provider-key", sync);
    return () => window.removeEventListener("khazak:provider-key", sync);
  }, [onKeyChange]);

  useEffect(() => {
    onKeyChange?.(savedKey);
  }, [savedKey, onKeyChange]);

  const validateAndSave = async () => {
    const key = draft.trim();
    if (!key) {
      setStatus({ tone: "error", text: "Paste your data.egov.kz API key first." });
      return;
    }

    setValidating(true);
    setStatus(null);
    try {
      const result = await validateDataEgovKey(key);
      if (!result.valid) {
        setStatus({ tone: "error", text: result.error || "Key validation failed." });
        return;
      }
      const meta = saveProviderKey(PROVIDER_ID, key, { validated: true });
      setSavedKey(key);
      setSavedMeta(meta);
      setDraft("");
      setStatus({ tone: "ok", text: result.message || "Key saved in this browser." });
      onKeyChange?.(key);
    } catch (e) {
      setStatus({ tone: "error", text: e.message });
    } finally {
      setValidating(false);
    }
  };

  const removeKey = () => {
    clearProviderKey(PROVIDER_ID);
    setSavedKey("");
    setSavedMeta(null);
    setDraft("");
    setStatus({ tone: "ok", text: "Saved key removed from this browser." });
    onKeyChange?.("");
  };

  return (
    <div className={`panel ${compact ? "mt-4" : "mt-6"} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
            data.egov.kz API key
          </h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Qazaq Stack cannot generate keys for you — they are issued only by the official Open Data portal.
            Save your key once here and every data.egov.kz entry in the tester will use it automatically.
          </p>
        </div>
        {savedKey && (
          <span className="chip bg-[var(--green)]/15 text-[var(--green)]">Key saved in browser</span>
        )}
      </div>

      {!compact && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Step n={1} title="Create an account">
            <p>
              Register on the national eGov ID portal, or sign in if you already have an account.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={LINKS.register} target="_blank" rel="noopener noreferrer" className="btn-metal text-xs">
                Register ↗
              </a>
              <a href={LINKS.login} target="_blank" rel="noopener noreferrer" className="btn-metal text-xs opacity-80">
                Sign in ↗
              </a>
            </div>
          </Step>

          <Step n={2} title="Open Developer Cabinet">
            <p>
              After login, open <strong>Кабинет разработчика</strong> to create or copy your free API key.
            </p>
            <a
              href={LINKS.cabinet}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-metal mt-3 inline-flex text-xs"
            >
              Developer cabinet ↗
            </a>
          </Step>

          <Step n={3} title="Paste & validate here">
            <p>
              One key works for all ~140 datasets. We validate it against a live request, then store it only in
              your browser — never on our servers.
            </p>
          </Step>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {savedKey ? (
          <div className="rounded-md border border-[var(--line)] bg-[var(--code-bg)] px-3 py-3 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">
              Saved key
            </p>
            <p className="mt-1 font-mono text-xs text-[var(--text-soft)]">
              {savedKey.slice(0, 4)}…{savedKey.slice(-4)}
            </p>
            {savedMeta?.savedAt && (
              <p className="mt-1 text-xs text-[var(--text-mute)]">
                Saved {new Date(savedMeta.savedAt).toLocaleString()}
                {savedMeta.validated ? " · validated" : ""}
              </p>
            )}
          </div>
        ) : (
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-mute)]">
              Paste your API key
            </span>
            <input
              type="password"
              autoComplete="off"
              placeholder="From Developer Cabinet → API keys"
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--code-bg)] px-3 py-2 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
        )}

        <div className="flex flex-wrap gap-2">
          {!savedKey && (
            <button type="button" className="btn-metal text-sm" onClick={validateAndSave} disabled={validating}>
              {validating ? "Validating…" : "Validate & save key"}
            </button>
          )}
          {savedKey && (
            <>
              <button
                type="button"
                className="btn-metal text-sm opacity-80"
                onClick={() => {
                  clearProviderKey(PROVIDER_ID);
                  setSavedKey("");
                  setSavedMeta(null);
                  setDraft("");
                  setStatus(null);
                  onKeyChange?.("");
                }}
              >
                Replace key
              </button>
              <button type="button" className="btn-metal text-sm opacity-80" onClick={removeKey}>
                Remove saved key
              </button>
            </>
          )}
        </div>

        {status && (
          <p className={`text-sm ${status.tone === "ok" ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
            {status.text}
          </p>
        )}

        <p className="text-xs text-[var(--text-mute)]">
          Why no generator? data.egov.kz keys are tied to your portal account and terms of use — only their
          Developer Cabinet can issue them.{" "}
          <a href={LINKS.samples} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline">
            API samples ↗
          </a>
          {" · "}
          <a href={LINKS.portal} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline">
            Portal ↗
          </a>
        </p>
      </div>
    </div>
  );
}
