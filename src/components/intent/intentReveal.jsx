import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useIntentReveal } from "../../hooks/useIntentReveal.js";

const IntentRevealContext = createContext(null);

export function buildIntentRevealSegments(blocks, view = "timeline") {
  const segments = ["header"];

  if (view === "timeline") segments.push("diagram");
  if (view === "flows") segments.push("canvas");
  if (view === "stack") segments.push("canvas", "trunk-1", "trunk-2", "trunk-3");
  else segments.push("intro");

  blocks.forEach((block, blockIndex) => {
    segments.push(`feature-${blockIndex}`);
    block.apis.forEach((_, apiIndex) => {
      segments.push(`api-${blockIndex}-${apiIndex}`);
    });
  });

  return segments;
}

export function IntentRevealProvider({ blocks, view, onGeneratingChange, children }) {
  const segments = useMemo(() => buildIntentRevealSegments(blocks, view), [blocks, view]);
  const reveal = useIntentReveal(segments, { active: Boolean(blocks.length) });

  useEffect(() => {
    onGeneratingChange?.(reveal.isGenerating);
  }, [onGeneratingChange, reveal.isGenerating]);

  return <IntentRevealContext.Provider value={reveal}>{children}</IntentRevealContext.Provider>;
}

export function useIntentRevealState() {
  return useContext(IntentRevealContext);
}

export function IntentRevealItem({ segment, className = "", children }) {
  const reveal = useIntentRevealState();
  if (!reveal?.isVisible(segment)) return null;

  return (
    <div className={`intent-reveal-item ${className}`.trim()} data-intent-segment={segment}>
      {children}
    </div>
  );
}

export function StreamingText({ text, className = "", charMs = 14, startDelayMs = 80, as: Tag = "p" }) {
  const reveal = useIntentRevealState();
  const reducedMotion = reveal?.reducedMotion;
  const [visible, setVisible] = useState(reducedMotion ? text.length : 0);

  useEffect(() => {
    if (!text) {
      setVisible(0);
      return undefined;
    }

    if (reducedMotion) {
      setVisible(text.length);
      return undefined;
    }

    setVisible(0);
    let index = 0;
    let typingTimer;
    const startTimer = setTimeout(() => {
      typingTimer = setInterval(() => {
        index += 1;
        setVisible(index);
        if (index >= text.length) clearInterval(typingTimer);
      }, charMs);
    }, startDelayMs);

    return () => {
      clearTimeout(startTimer);
      clearInterval(typingTimer);
    };
  }, [text, charMs, startDelayMs, reducedMotion]);

  if (!text) return null;

  const done = visible >= text.length;

  return (
    <Tag className={`intent-stream-text ${className}`.trim()}>
      {text.slice(0, visible)}
      {!done ? <span className="intent-stream-cursor" aria-hidden="true" /> : null}
    </Tag>
  );
}
