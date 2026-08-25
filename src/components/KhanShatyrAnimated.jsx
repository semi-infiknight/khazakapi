import { useEffect, useState } from "react";
import { GRID_RADIALS, GRID_RINGS, STREAK_ROUTES, VIEWBOX } from "../lib/khanShatyrGrid.js";

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

export default function KhanShatyrAnimated({ className = "" }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`ks-art-stack ${className}`.trim()} aria-hidden="true">
      <img src="/khan-shatyr.svg" alt="" className="ks-art-base" decoding="async" />

      <svg
        className="ks-art-overlay"
        viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
        preserveAspectRatio="xMaxYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ks-streak-cyan" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(123, 190, 245, 0)" />
            <stop offset="35%" stopColor="rgba(123, 190, 245, 0.85)" />
            <stop offset="100%" stopColor="rgba(247, 242, 247, 0.95)" />
          </linearGradient>
          <linearGradient id="ks-streak-violet" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(185, 96, 232, 0)" />
            <stop offset="40%" stopColor="rgba(157, 78, 227, 0.9)" />
            <stop offset="100%" stopColor="rgba(247, 242, 247, 0.9)" />
          </linearGradient>
          <filter id="ks-streak-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="ks-grid">
          {GRID_RADIALS.map((line) => (
            <path
              key={line.id}
              d={line.d}
              className="ks-grid-radial"
              style={{ "--ks-radial-i": line.t }}
            />
          ))}
          {GRID_RINGS.map((line) => (
            <path key={line.id} d={line.d} className="ks-grid-ring" style={{ "--ks-ring-i": line.ringIdx }} />
          ))}
        </g>

        {!reducedMotion && (
          <g className="ks-streaks" filter="url(#ks-streak-glow)">
            {STREAK_ROUTES.map((route) => (
              <g key={route.id}>
                <path
                  d={route.d}
                  className="ks-streak-track"
                  stroke={route.color}
                  strokeWidth={route.width}
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    "--ks-streak-dur": `${route.duration}s`,
                    "--ks-streak-delay": `${route.delay}s`,
                  }}
                />
                <path
                  d={route.d}
                  className="ks-streak-head"
                  stroke="#F7F2F7"
                  strokeWidth={route.width + 1.2}
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    "--ks-streak-dur": `${route.duration}s`,
                    "--ks-streak-delay": `${route.delay}s`,
                  }}
                />
              </g>
            ))}
          </g>
        )}

        {!reducedMotion && (
          <g className="ks-apex-pulse">
            <circle cx="279" cy="12" r="3.5" className="ks-apex-core" />
            <circle cx="279" cy="12" r="8" className="ks-apex-ring" />
          </g>
        )}
      </svg>
    </div>
  );
}
