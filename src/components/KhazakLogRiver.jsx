import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { KZ_RIVER_LOGS } from "../data/kzRiverLogs.js";
import { buildRiverSegment, RIVER_MIN_SEGMENT_PX, riverAnimationDuration } from "../lib/kzRiverLoop.js";

function RiverLine({ entry }) {
  const statusClass =
    entry.status === "ok" ? "kz-river-ok" : entry.status === "deny" ? "kz-river-deny" : "kz-river-warn";

  return (
    <div className="kz-river-line">
      <span className="kz-river-dim">{entry.time}</span>{" "}
      <span className="kz-river-a">{entry.agent}</span> · {entry.method} {entry.path} · {entry.vendor} ·{" "}
      <span className={statusClass}>{entry.detail}</span>
      {entry.meta ? (
        <>
          {" "}
          · <span className="kz-river-dim">{entry.meta}</span>
        </>
      ) : null}
    </div>
  );
}

function RiverSegment({ segment, segmentRef, ariaHidden = false }) {
  return (
    <div className="kz-river-segment" ref={segmentRef} aria-hidden={ariaHidden || undefined}>
      {segment.map((entry, index) => (
        <RiverLine key={`${entry.time}-${entry.vendor}-${index}`} entry={entry} />
      ))}
    </div>
  );
}

export default function KhazakLogRiver({ variant = "section" }) {
  const segmentRef = useRef(null);
  const [loopShift, setLoopShift] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(
    () => (typeof window !== "undefined" ? window.innerHeight : RIVER_MIN_SEGMENT_PX.page)
  );

  const segment = useMemo(() => {
    const minPx =
      variant === "page" ? Math.max(RIVER_MIN_SEGMENT_PX.page, viewportHeight) : RIVER_MIN_SEGMENT_PX.section;
    return buildRiverSegment(KZ_RIVER_LOGS, variant, minPx);
  }, [variant, viewportHeight]);

  const duration = riverAnimationDuration(segment.length, variant);

  useLayoutEffect(() => {
    if (variant !== "page") return undefined;

    const syncViewport = () => setViewportHeight(window.innerHeight);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, [variant]);

  useLayoutEffect(() => {
    const node = segmentRef.current;
    if (!node) return undefined;

    const measure = () => {
      const height = node.offsetHeight;
      if (height > 0) setLoopShift(height);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [variant, segment.length]);

  const trackStyle = {
    ...(loopShift ? { "--kz-river-shift": `${loopShift}px` } : null),
    animationDuration: `${duration}s`,
  };

  return (
    <div className={`kz-river${variant === "page" ? " kz-river--page" : ""}`} aria-hidden="true">
      <div className="kz-river-track" style={trackStyle}>
        <RiverSegment segment={segment} segmentRef={segmentRef} />
        <RiverSegment segment={segment} ariaHidden />
      </div>
    </div>
  );
}
