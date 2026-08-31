/** Khan Shatyr — data streaks follow exact SVG stroke paths only */

import STROKES from "./khanShatyrStrokes.json";

export const VIEWBOX = { w: 400, h: 267 };

/** Arch animation anchor points in viewBox space */
export const ARCH_ANCHORS = {
  in: { x: 78, y: 210 },
  spire: { x: 281, y: 7 },
  out: { x: 312, y: 24 },
};

/** Long mesh stroke used for the one-shot routing pulse toward the spire */
export const ARCH_ROUTE_STROKE = STROKES.find((stroke) => stroke.idx === 401) ?? STROKES[0];

const ARCH_ANCHOR_MARKUP = `<g class="ks-af-anchors" aria-hidden="true">
  <circle class="ks-af-anchor ks-af-anchor-in" cx="${ARCH_ANCHORS.in.x}" cy="${ARCH_ANCHORS.in.y}" r="1.5" />
  <circle class="ks-af-anchor ks-af-anchor-spire" cx="${ARCH_ANCHORS.spire.x}" cy="${ARCH_ANCHORS.spire.y}" r="1.5" />
  <circle class="ks-af-anchor ks-af-anchor-out" cx="${ARCH_ANCHORS.out.x}" cy="${ARCH_ANCHORS.out.y}" r="1.5" />
</g>`;

const ARCH_ROUTE_MARKUP = `<path
  class="ks-af-route"
  d="${ARCH_ROUTE_STROKE.d}"
  pathLength="1"
  stroke="${ARCH_ROUTE_STROKE.fill}"
  stroke-width="1.6"
  stroke-linecap="round"
  stroke-linejoin="round"
  fill="none"
/>`;

const SVG_EXTRA_DEFS = `
<filter id="ks-streak-glow" x="-100%" y="-100%" width="300%" height="300%">
  <feGaussianBlur stdDeviation="0.9" result="blur" />
  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>`;

function streakStyle(stroke, i) {
  const duration = (1.6 + stroke.length / 55).toFixed(2);
  const delay = ((i * 0.11) % 3.4).toFixed(2);
  return `--ks-streak-dur:${duration}s;--ks-streak-delay:${delay}s`;
}

function streakWidth(stroke) {
  if (stroke.kind === "ring") return 1.1;
  return stroke.length > 70 ? 1.5 : 1.25;
}

/** Animated streak markup — each path uses the exact \`d\` from the artwork vector */
export function buildSvgDataLayer(reducedMotion = false) {
  if (reducedMotion) return "";

  const streaks = STROKES.map((stroke, i) => {
    const style = streakStyle(stroke, i);
    const w = streakWidth(stroke);
    const rev = stroke.reverse ? " ks-streak-reverse" : "";
    const headW = (w + 0.8).toFixed(2);
    return `<g class="ks-streak" data-stroke-idx="${stroke.idx}">
      <path d="${stroke.d}" class="ks-streak-track${rev}" stroke="${stroke.fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none" style="${style}" />
      <path d="${stroke.d}" class="ks-streak-head${rev}" stroke="#F7F2F7" stroke-width="${headW}" stroke-linecap="round" stroke-linejoin="round" fill="none" style="${style}" />
    </g>`;
  }).join("\n    ");

  return `<g class="ks-data-layer" aria-hidden="true">
    <g class="ks-streaks" filter="url(#ks-streak-glow)">
    ${streaks}
    </g>
  </g>`;
}

/** Merge streak paths into the Khan Shatyr SVG source */
export function buildInlineKhanShatyrSvg(svgRaw, reducedMotion = false, align = "right") {
  const dataLayer = buildSvgDataLayer(reducedMotion);
  const preserveAspectRatio = align === "center" ? "xMidYMid meet" : "xMaxYMid meet";

  let svg = svgRaw.replace(
    "<svg ",
    `<svg class="ks-inline-svg" preserveAspectRatio="${preserveAspectRatio}" `,
  );

  svg = svg.replace("<defs>", `<defs>${SVG_EXTRA_DEFS}`);

  if (dataLayer) {
    svg = svg.replace(
      "</g>\n<defs>",
      `  ${dataLayer}\n  ${ARCH_ANCHOR_MARKUP}\n  ${ARCH_ROUTE_MARKUP}\n</g>\n<defs>`,
    );
  } else {
    svg = svg.replace("</g>\n<defs>", `  ${ARCH_ANCHOR_MARKUP}\n  ${ARCH_ROUTE_MARKUP}\n</g>\n<defs>`);
  }

  return svg;
}
