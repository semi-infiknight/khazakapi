export function FreshnessBadge({ freshness }) {
  if (!freshness?.label) return null;
  const toneClass =
    freshness.tone === "live"
      ? "badge-live"
      : freshness.tone === "stale"
        ? "badge-stale"
        : "badge-current";
  return <span className={toneClass}>{freshness.label}</span>;
}

export function TrustDot({ copyable, auth }) {
  if (copyable && auth === "none") {
    return (
      <span className="font-mono text-[10px] text-[var(--green)]" title="Live · Copy-paste">
        ●Live
      </span>
    );
  }
  if (auth === "none") {
    return <span className="font-mono text-[10px] text-[var(--text-mute)]">●Open</span>;
  }
  return <span className="font-mono text-[10px] text-[var(--amber)]">●Setup</span>;
}

export function CopyPasteTag({ copyable }) {
  if (!copyable) return null;
  return <span className="font-mono text-[10px] text-[var(--text-soft)]">Copy-paste</span>;
}
