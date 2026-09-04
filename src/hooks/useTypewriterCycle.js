import { useEffect, useRef, useState } from "react";

const DEFAULT_TIMING = {
  typeMs: 34,
  deleteMs: 18,
  pauseMs: 2200,
  gapMs: 420,
};

/**
 * Cycles through lines with type → pause → backspace → next.
 * Pauses and resets when `active` is false.
 */
export function useTypewriterCycle(lines, { active = true, timing = DEFAULT_TIMING } = {}) {
  const [text, setText] = useState("");
  const lineIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const phaseRef = useRef("typing");

  useEffect(() => {
    const safeLines = lines?.length ? lines : [""];

    if (!active) {
      setText("");
      lineIndexRef.current = 0;
      charIndexRef.current = 0;
      phaseRef.current = "typing";
      return undefined;
    }

    let cancelled = false;
    let timer;

    const schedule = (ms, fn) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      let index = 0;
      setText(safeLines[0] ?? "");
      timer = setInterval(() => {
        index = (index + 1) % safeLines.length;
        setText(safeLines[index] ?? "");
      }, timing.pauseMs + timing.gapMs);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }

    const tick = () => {
      const line = safeLines[lineIndexRef.current % safeLines.length] ?? "";

      if (phaseRef.current === "typing") {
        if (charIndexRef.current < line.length) {
          charIndexRef.current += 1;
          setText(line.slice(0, charIndexRef.current));
          schedule(timing.typeMs, tick);
          return;
        }
        phaseRef.current = "pause";
        schedule(timing.pauseMs, tick);
        return;
      }

      if (phaseRef.current === "pause") {
        phaseRef.current = "deleting";
        schedule(timing.gapMs, tick);
        return;
      }

      if (charIndexRef.current > 0) {
        charIndexRef.current -= 1;
        setText(line.slice(0, charIndexRef.current));
        schedule(timing.deleteMs, tick);
        return;
      }

      lineIndexRef.current = (lineIndexRef.current + 1) % safeLines.length;
      phaseRef.current = "typing";
      schedule(timing.gapMs, tick);
    };

    schedule(timing.gapMs, tick);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(timer);
    };
  }, [
    active,
    lines,
    timing.deleteMs,
    timing.gapMs,
    timing.pauseMs,
    timing.typeMs,
  ]);

  return { text };
}
