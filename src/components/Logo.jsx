import { KAZAKHSTAN_LOGO_PATH, KAZAKHSTAN_LOGO_TEXT } from "../lib/kazakhstanSilhouette.js";

export default function Logo() {
  return (
    <svg className="brand-kz-logo" viewBox="0 0 278 100" aria-label="Qazaq Stack">
      <path className="brand-kz-map" d={KAZAKHSTAN_LOGO_PATH} />
      <text
        x={KAZAKHSTAN_LOGO_TEXT.x}
        y={KAZAKHSTAN_LOGO_TEXT.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="brand-kz-wordmark"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontSize="10.5"
        letterSpacing="-0.01em"
      >
        <tspan fontWeight="700">QAZAQ</tspan>
        <tspan fontWeight="400" opacity="0.78">
          {" STACK"}
        </tspan>
      </text>
    </svg>
  );
}
