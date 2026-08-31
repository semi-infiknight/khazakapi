import { useEffect, useMemo, useState } from "react";
import khanShatyrRaw from "../../public/khan-shatyr.svg?raw";
import { buildInlineKhanShatyrSvg } from "../lib/khanShatyrGrid.js";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export default function KhanShatyrAnimated({ className = "", align = "right" }) {
  const reducedMotion = useReducedMotion();
  const svgMarkup = useMemo(
    () => buildInlineKhanShatyrSvg(khanShatyrRaw, reducedMotion, align),
    [reducedMotion, align],
  );

  return (
    <div
      className={`ks-art-inline ${className}`.trim()}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
