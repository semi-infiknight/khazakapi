import { KZ_RIVER_LOGS } from "../data/kzRiverLogs.js";

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

export default function KhazakLogRiver({ variant = "section" }) {
  const loop = [...KZ_RIVER_LOGS, ...KZ_RIVER_LOGS];

  return (
    <div className={`kz-river${variant === "page" ? " kz-river--page" : ""}`} aria-hidden="true">
      <div className="kz-river-track">
        {loop.map((entry, index) => (
          <RiverLine key={`${entry.time}-${entry.vendor}-${index}`} entry={entry} />
        ))}
      </div>
    </div>
  );
}
