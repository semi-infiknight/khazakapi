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

export function useIntentReveal(segments, { active = true, stepMs = 340, startMs = 120 } = {}) {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!active || !segments.length) {
      setStep(-1);
      return undefined;
    }

    if (reducedMotion) {
      setStep(segments.length - 1);
      return undefined;
    }

    setStep(-1);
    const timers = [];
    let current = -1;

    const advance = () => {
      current += 1;
      setStep(current);
      if (current < segments.length - 1) {
        timers.push(setTimeout(advance, stepMs));
      }
    };

    timers.push(setTimeout(advance, startMs));
    return () => timers.forEach(clearTimeout);
  }, [active, segments, stepMs, startMs, reducedMotion]);

  const isVisible = (segmentId) => {
    const index = segments.indexOf(segmentId);
    if (index === -1) return true;
    return step >= index;
  };

  const isGenerating = step >= 0 && step < segments.length - 1;

  return {
    step,
    segments,
    isVisible,
    isGenerating,
    reducedMotion,
  };
}
