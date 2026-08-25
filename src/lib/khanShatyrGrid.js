/** Khan Shatyr cable grid — tuned to public/khan-shatyr.svg (400×267) */

export const VIEWBOX = { w: 400, h: 267 };

/** Mast / apex where radial cables converge */
export const APEX = { x: 279, y: 12 };

/** Base ring sample along the tent footprint (t: 0 → 1, left base → right base) */
export function basePoint(t) {
  const x = 168 + t * 228;
  const arch = Math.sin(t * Math.PI);
  const y = 251 - arch * 14 - (t < 0.35 ? (0.35 - t) * 18 : 0);
  return { x, y };
}

/** Point along a radial cable at normalized height (0 = apex, 1 = base) */
export function radialPoint(t, height) {
  const base = basePoint(t);
  const curve = Math.sin(height * Math.PI) * 6;
  return {
    x: APEX.x + (base.x - APEX.x) * height + curve * (t - 0.5) * 0.35,
    y: APEX.y + (base.y - APEX.y) * height - curve * 0.25,
  };
}

const RADIAL_COUNT = 22;
const RING_HEIGHTS = [0.22, 0.36, 0.48, 0.6, 0.72, 0.84];

/** Radial cable paths (apex → base) */
export function buildRadials() {
  return Array.from({ length: RADIAL_COUNT }, (_, i) => {
    const t = i / (RADIAL_COUNT - 1);
    const base = basePoint(t);
    return {
      id: `radial-${i}`,
      t,
      d: `M ${APEX.x} ${APEX.y} L ${base.x.toFixed(1)} ${base.y.toFixed(1)}`,
    };
  });
}

/** Horizontal ring segments connecting adjacent radials */
export function buildRings() {
  return RING_HEIGHTS.flatMap((height, ringIdx) => {
    const segments = [];
    for (let i = 0; i < RADIAL_COUNT - 1; i += 1) {
      const t0 = i / (RADIAL_COUNT - 1);
      const t1 = (i + 1) / (RADIAL_COUNT - 1);
      const p0 = radialPoint(t0, height);
      const p1 = radialPoint(t1, height);
      segments.push({
        id: `ring-${ringIdx}-${i}`,
        ringIdx,
        d: `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`,
      });
    }
    return segments;
  });
}

/** Data streak routes — travel from base upward toward the apex */
export function buildStreakRoutes(radials) {
  const routes = [];

  radials.forEach((radial, i) => {
    if (i % 2 !== 0) return;
    const base = basePoint(radial.t);
    routes.push({
      id: `streak-r-${i}`,
      d: `M ${base.x.toFixed(1)} ${base.y.toFixed(1)} L ${APEX.x} ${APEX.y}`,
      duration: 2.4 + (i % 5) * 0.35,
      delay: (i * 0.17) % 2.8,
      width: i % 4 === 0 ? 3.2 : 2.4,
      color: i % 3 === 0 ? "#7BBEF5" : i % 3 === 1 ? "#B960E8" : "#9C88FA",
    });
  });

  RING_HEIGHTS.forEach((height, ringIdx) => {
    for (let i = 0; i < RADIAL_COUNT - 1; i += 3) {
      const t0 = i / (RADIAL_COUNT - 1);
      const t1 = (i + 2) / (RADIAL_COUNT - 1);
      const start = radialPoint(t0, height);
      const end = radialPoint(t1, Math.max(0.08, height - 0.28));
      routes.push({
        id: `streak-hop-${ringIdx}-${i}`,
        d: `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
        duration: 1.8 + ringIdx * 0.25,
        delay: ringIdx * 0.4 + i * 0.11,
        width: 2,
        color: ringIdx % 2 === 0 ? "#7D57F9" : "#E588F3",
      });
    }
  });

  [0.12, 0.55, 0.88].forEach((t, idx) => {
    const start = radialPoint(t, 0.92);
    const mid = radialPoint(t + 0.08, 0.55);
    const end = radialPoint(t + 0.04, 0.18);
    routes.push({
      id: `streak-diag-${idx}`,
      d: `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} L ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
      duration: 3.2 + idx * 0.5,
      delay: idx * 0.9,
      width: 2.6,
      color: "#F96CD4",
    });
  });

  return routes;
}

export const GRID_RADIALS = buildRadials();
export const GRID_RINGS = buildRings();
export const STREAK_ROUTES = buildStreakRoutes(GRID_RADIALS);

const SVG_EXTRA_DEFS = `
<filter id="ks-streak-glow" x="-80%" y="-80%" width="260%" height="260%">
  <feGaussianBlur stdDeviation="1.4" result="blur" />
  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>`;

/** SVG markup for grid + streak paths — injected inside the Khan Shatyr vector */
export function buildSvgDataLayer(reducedMotion = false) {
  const grid = [
    ...GRID_RADIALS.map(
      (line) =>
        `<path d="${line.d}" class="ks-grid-radial" style="--ks-radial-i:${line.t}" fill="none" />`,
    ),
    ...GRID_RINGS.map(
      (line) =>
        `<path d="${line.d}" class="ks-grid-ring" style="--ks-ring-i:${line.ringIdx}" fill="none" />`,
    ),
  ].join("\n    ");

  if (reducedMotion) {
    return `<g class="ks-data-layer" aria-hidden="true">\n    ${grid}\n  </g>`;
  }

  const streaks = STREAK_ROUTES.map((route) => {
    const style = `--ks-streak-dur:${route.duration}s;--ks-streak-delay:${route.delay}s`;
    return `<g class="ks-streak">
      <path d="${route.d}" class="ks-streak-track" stroke="${route.color}" stroke-width="${route.width}" stroke-linecap="round" fill="none" style="${style}" />
      <path d="${route.d}" class="ks-streak-head" stroke="#F7F2F7" stroke-width="${route.width + 1.2}" stroke-linecap="round" fill="none" style="${style}" />
    </g>`;
  }).join("\n    ");

  return `<g class="ks-data-layer" aria-hidden="true">
    ${grid}
    <g class="ks-streaks" filter="url(#ks-streak-glow)">
    ${streaks}
    </g>
    <g class="ks-apex-pulse">
      <circle cx="${APEX.x}" cy="${APEX.y}" r="3.5" class="ks-apex-core" />
      <circle cx="${APEX.x}" cy="${APEX.y}" r="8" class="ks-apex-ring" fill="none" />
    </g>
  </g>`;
}

/** Merge animation paths into the Khan Shatyr SVG source */
export function buildInlineKhanShatyrSvg(svgRaw, reducedMotion = false) {
  const dataLayer = buildSvgDataLayer(reducedMotion);

  return svgRaw
    .replace(
      "<svg ",
      '<svg class="ks-inline-svg" preserveAspectRatio="xMaxYMid meet" ',
    )
    .replace("<defs>", `<defs>${SVG_EXTRA_DEFS}`)
    .replace("</g>\n<defs>", `  ${dataLayer}\n</g>\n<defs>`);
}
