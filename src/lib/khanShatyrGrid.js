/** Khan Shatyr — data streaks follow exact SVG stroke paths only */

import STROKES from "./khanShatyrStrokes.json";

export const VIEWBOX = { w: 400, h: 267 };

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
export function buildInlineKhanShatyrSvg(svgRaw, reducedMotion = false) {
  const dataLayer = buildSvgDataLayer(reducedMotion);

  let svg = svgRaw.replace(
    "<svg ",
    '<svg class="ks-inline-svg" preserveAspectRatio="xMaxYMid meet" ',
  );

  svg = svg.replace("<defs>", `<defs>${SVG_EXTRA_DEFS}`);

  if (dataLayer) {
    svg = svg.replace("</g>\n<defs>", `  ${dataLayer}\n</g>\n<defs>`);
  }

  return svg;
}
