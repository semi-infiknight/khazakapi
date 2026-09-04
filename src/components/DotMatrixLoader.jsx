/**
 * Gate Shift — circular dot-matrix loader (dotm-circular-7 inspired).
 * Pure CSS/SVG, no external dependency.
 */
export default function DotMatrixLoader({ size = 120, dotSize = 8, label }) {
  const dots = 12;
  const radius = size / 2 - dotSize;
  return (
    <div
      className="dotm-loader"
      role="status"
      aria-live="polite"
      style={{ "--dotm-size": `${size}px`, "--dotm-dot": `${dotSize}px` }}
    >
      <div className="dotm-ring">
        {Array.from({ length: dots }).map((_, i) => {
          const angle = (i / dots) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <span
              key={i}
              className="dotm-dot"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                animationDelay: `${(i / dots) * 1.6}s`,
              }}
            />
          );
        })}
        <span className="dotm-gate dotm-gate-v" />
        <span className="dotm-gate dotm-gate-h" />
      </div>
      {label ? <span className="dotm-label">{label}</span> : null}
    </div>
  );
}
