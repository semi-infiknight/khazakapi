import { useEffect, useRef, useState } from "react";

const VIEW_W = 960;
const VIEW_H = 420;
const APEX = { x: 430, y: 58 };
const BASE_Y = 352;

function cablePoints(count = 28) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const x = 70 + t * (VIEW_W - 140);
    const arch = Math.sin(t * Math.PI);
    const y = BASE_Y - arch * 18 - (t < 0.5 ? t * 8 : (1 - t) * 8);
    points.push({ x, y });
  }
  return points;
}

const CABLES = cablePoints();

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

export default function KhanShatyrHero({ children }) {
  const stageRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0.52, y: 0.42, active: false });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion) return undefined;

    const update = (clientX, clientY) => {
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      setPointer({
        x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
        active: true,
      });
    };

    const onMove = (e) => update(e.clientX, e.clientY);
    const onLeave = () => setPointer((p) => ({ ...p, active: false }));

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  const px = pointer.x;
  const py = pointer.y;
  const tiltX = reducedMotion ? 0 : (px - 0.5) * 14;
  const tiltY = reducedMotion ? 0 : (py - 0.5) * 10;
  const glowX = reducedMotion ? 52 : px * 100;
  const glowY = reducedMotion ? 38 : py * 100;

  const style = {
    "--ks-tilt-x": `${tiltX}deg`,
    "--ks-tilt-y": `${tiltY}deg`,
    "--ks-glow-x": `${glowX}%`,
    "--ks-glow-y": `${glowY}%`,
    "--ks-pointer-x": px,
    "--ks-pointer-y": py,
  };

  return (
    <section className="ks-hero mb-8" style={style}>
      <div
        ref={stageRef}
        className={`ks-stage ${pointer.active ? "ks-stage-active" : ""} ${reducedMotion ? "ks-stage-static" : ""}`}
        aria-hidden="true"
      >
        <div className="ks-parallax ks-parallax-back">
          <svg className="ks-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="ks-sky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#120818" />
                <stop offset="55%" stopColor="#1a0f24" />
                <stop offset="100%" stopColor="#0a0510" />
              </linearGradient>
              <linearGradient id="ks-base-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2a2430" />
                <stop offset="100%" stopColor="#120f16" />
              </linearGradient>
              <linearGradient id="ks-membrane" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 214, 140, 0.08)" />
                <stop offset="35%" stopColor="rgba(255, 196, 71, 0.42)" />
                <stop offset="62%" stopColor="rgba(255, 160, 70, 0.28)" />
                <stop offset="100%" stopColor="rgba(201, 207, 214, 0.12)" />
              </linearGradient>
              <linearGradient id="ks-membrane-edge" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 230, 170, 0.55)" />
                <stop offset="100%" stopColor="rgba(255, 196, 71, 0.05)" />
              </linearGradient>
              <radialGradient id="ks-inner-glow" cx="50%" cy="35%" r="55%">
                <stop offset="0%" stopColor="rgba(255, 210, 120, 0.35)" />
                <stop offset="55%" stopColor="rgba(255, 160, 60, 0.08)" />
                <stop offset="100%" stopColor="rgba(255, 160, 60, 0)" />
              </radialGradient>
              <filter id="ks-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            <rect width={VIEW_W} height={VIEW_H} fill="url(#ks-sky)" />

            <ellipse cx={VIEW_W / 2} cy={BASE_Y + 28} rx={390} ry={34} fill="url(#ks-base-fill)" opacity="0.95" />

            <path
              className="ks-tent-shadow"
              d={`M 64 ${BASE_Y} Q 180 250, ${APEX.x - 20} ${APEX.y + 8} Q 520 40, 700 210 T 896 ${BASE_Y} Q ${VIEW_W / 2} ${BASE_Y + 24}, 64 ${BASE_Y} Z`}
              fill="rgba(0,0,0,0.35)"
              filter="url(#ks-soft-blur)"
            />

            <g className="ks-cables">
              {CABLES.map((pt, i) => (
                <line
                  key={i}
                  x1={APEX.x}
                  y1={APEX.y + 16}
                  x2={pt.x}
                  y2={pt.y}
                  stroke="rgba(201, 207, 214, 0.14)"
                  strokeWidth={i % 4 === 0 ? 1.1 : 0.65}
                />
              ))}
              {CABLES.filter((_, i) => i % 3 === 0).map((pt, i) => (
                <line
                  key={`hoop-${i}`}
                  x1={pt.x}
                  y1={pt.y}
                  x2={CABLES[Math.min(CABLES.length - 1, i * 3 + 3)]?.x ?? pt.x}
                  y2={CABLES[Math.min(CABLES.length - 1, i * 3 + 3)]?.y ?? pt.y}
                  stroke="rgba(201, 207, 214, 0.08)"
                  strokeWidth="0.5"
                />
              ))}
            </g>

            <path
              className="ks-tent-body"
              d={`M 72 ${BASE_Y} C 120 240, 250 120, ${APEX.x} ${APEX.y} C 560 95, 690 210, 888 ${BASE_Y} C 720 ${BASE_Y + 8}, 240 ${BASE_Y + 8}, 72 ${BASE_Y} Z`}
              fill="url(#ks-membrane)"
            />

            <path
              className="ks-tent-body"
              d={`M 72 ${BASE_Y} C 120 240, 250 120, ${APEX.x} ${APEX.y} C 560 95, 690 210, 888 ${BASE_Y} C 720 ${BASE_Y + 8}, 240 ${BASE_Y + 8}, 72 ${BASE_Y} Z`}
              fill="url(#ks-inner-glow)"
            />

            <path
              className="ks-tent-rim"
              d={`M 72 ${BASE_Y} C 120 240, 250 120, ${APEX.x} ${APEX.y}`}
              fill="none"
              stroke="url(#ks-membrane-edge)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              className="ks-tent-rim"
              d={`M ${APEX.x} ${APEX.y} C 560 95, 690 210, 888 ${BASE_Y}`}
              fill="none"
              stroke="url(#ks-membrane-edge)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.75"
            />

            <g className="ks-etfe-panels">
              {[0.22, 0.38, 0.52, 0.66, 0.78].map((t, i) => {
                const x1 = 140 + t * 560;
                const y1 = BASE_Y - Math.sin(t * Math.PI) * 120 - 40;
                const x2 = x1 + 38;
                const y2 = y1 + 95;
                return (
                  <rect
                    key={i}
                    x={x1}
                    y={y1}
                    width="34"
                    height="88"
                    rx="3"
                    transform={`rotate(${(t - 0.5) * 18} ${x1 + 17} ${y1 + 44})`}
                    fill="none"
                    stroke="rgba(255, 230, 180, 0.08)"
                    strokeWidth="1"
                  />
                );
              })}
            </g>

            <g className="ks-mast">
              <line x1={APEX.x} y1={BASE_Y - 40} x2={APEX.x} y2={APEX.y - 6} stroke="rgba(201, 207, 214, 0.35)" strokeWidth="3" />
              <line x1={APEX.x - 18} y1={BASE_Y - 8} x2={APEX.x} y2={APEX.y} stroke="rgba(201, 207, 214, 0.22)" strokeWidth="1.5" />
              <line x1={APEX.x + 20} y1={BASE_Y - 6} x2={APEX.x} y2={APEX.y} stroke="rgba(201, 207, 214, 0.22)" strokeWidth="1.5" />
              <line x1={APEX.x - 8} y1={BASE_Y + 2} x2={APEX.x} y2={APEX.y} stroke="rgba(201, 207, 214, 0.18)" strokeWidth="1.2" />
              <circle cx={APEX.x} cy={APEX.y - 10} r="5" fill="rgba(255, 220, 150, 0.85)" />
              <line x1={APEX.x} y1={APEX.y - 10} x2={APEX.x} y2={22} stroke="rgba(255, 230, 180, 0.5)" strokeWidth="1.2" />
              <circle cx={APEX.x} cy={18} r="3" fill="rgba(255, 230, 180, 0.7)" />
            </g>
          </svg>
        </div>

        <div className="ks-spotlight" />
        <div className="ks-shimmer" />
      </div>

      <div className="ks-copy">{children}</div>
    </section>
  );
}
