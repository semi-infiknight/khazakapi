import { useEffect, useState } from "react";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export function defaultIntentStepDelay(prevSegment, nextSegment) {
  if (nextSegment?.startsWith("api-")) return 280;
  if (nextSegment?.startsWith("feature-")) return 780;
  if (nextSegment === "intro") return 520;
  if (nextSegment === "diagram" || nextSegment === "canvas") return 480;
  if (nextSegment?.startsWith("trunk-")) return 520;
  return 560;
}

export function useIntentReveal(
  segments,
  { active = true, startMs = 220, getStepDelay = defaultIntentStepDelay, generationKey } = {},
) {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(-1);
  const lastKeyRef = useRef(undefined);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active || !segments.length) {
      setStep(-1);
      return undefined;
    }

    if (reducedMotion) {
      setStep(segments.length - 1);
      return undefined;
    }

    // If the generation key hasn't changed (e.g. just a tab switch),
    // skip re-animation and show everything immediately.
    if (generationKey !== undefined && lastKeyRef.current === generationKey && completedRef.current) {
      setStep(segments.length - 1);
      return undefined;
    }

    lastKeyRef.current = generationKey;
    completedRef.current = false;
    setStep(-1);
    const timers = [];
    let current = -1;

    const advance = () => {
      current += 1;
      setStep(current);
      if (current < segments.length - 1) {
        const delay = getStepDelay(segments[current], segments[current + 1], current);
        timers.push(setTimeout(advance, delay));
      } else {
        completedRef.current = true;
      }
    };

    timers.push(setTimeout(advance, startMs));
    return () => timers.forEach(clearTimeout);
  }, [active, segments, startMs, getStepDelay, reducedMotion, generationKey]);

  const isVisible = (segmentId) => {
    const index = segments.indexOf(segmentId);
    if (index === -1) return true;
    return step >= index;
  };

  const isActive = (segmentId) => step === segments.indexOf(segmentId);

  const isGenerating = step >= 0 && step < segments.length - 1;

  return {
    step,
    segments,
    isVisible,
    isActive,
    isGenerating,
    reducedMotion,
  };
}
