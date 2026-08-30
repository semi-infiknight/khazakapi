import { useState } from "react";
import { askApi } from "../lib/api.js";

const STARTERS = [
  "How do I authenticate?",
  "What query parameters do I need?",
  "How do I get started?",
  "What is this API for?",
];

export default function ApiDocAssistant({ api }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);
  const [error, setError] = useState(null);

  async function submit(q = question) {
    const text = String(q || "").trim();
    if (!text || !api?.id) return;

    setQuestion(text);
    setLoading(true);
    setError(null);

    try {
      const res = await askApi(api.id, text);
      setReply(res);
    } catch (e) {
      setError(e.message || "Ask failed");
      setReply(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel api-doc-assistant mt-6 p-5" aria-label="Ask about this API">
      <header className="api-doc-assistant-head">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Ask about this API</h2>
        <span className="api-doc-assistant-meta">Grounded in catalogue setup &amp; try spec</span>
      </header>

      <p className="api-doc-assistant-lead">
        Answers use this page&apos;s setup steps, auth details, and sample request parameters — not full provider
        documentation.
      </p>

      <div className="api-doc-assistant-starters">
        {STARTERS.map((label) => (
          <button
            key={label}
            type="button"
            className="chip api-doc-assistant-chip"
            disabled={loading}
            onClick={() => submit(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="api-doc-assistant-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          className="search-input api-doc-assistant-input"
          type="search"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about auth, params, or setup…"
          aria-label="Question about this API"
          disabled={loading}
        />
        <button type="submit" className="btn-metal api-doc-assistant-submit" disabled={loading || !question.trim()}>
          {loading ? "…" : "Ask"}
        </button>
      </form>

      {error && <p className="api-doc-assistant-error">{error}</p>}

      {reply && (
        <div className="api-doc-assistant-answer" aria-live="polite">
          <div className="api-doc-assistant-answer-head">
            <span className="api-doc-assistant-role">assistant</span>
            <span className="api-doc-assistant-source">
              {reply.source === "llm" ? "ai · catalogue facts" : "catalogue"}
            </span>
          </div>
          <p className="api-doc-assistant-answer-body">{reply.answer}</p>
          {reply.docs && (
            <a
              href={reply.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="api-doc-assistant-docs"
            >
              Provider docs ↗
            </a>
          )}
        </div>
      )}
    </section>
  );
}
