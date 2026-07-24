export default function Footer() {
  return (
    <footer className="container-main border-t border-[var(--line)] py-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--accent)]">Khazak API</p>
          <p className="mt-2 max-w-md text-sm text-[var(--text-soft)]">
            Verified APIs for Kazakhstan — Astana, Almaty, Shymkent, +7. Copy the call, ship faster.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <a href="/docs.html" className="foot-link">
            Docs
          </a>
          <a href="/api/catalogue" className="foot-link">
            /api/catalogue
          </a>
          <a href="/mcp" className="foot-link">
            /mcp
          </a>
        </div>
      </div>
      <p className="mt-6 font-mono text-xs text-[var(--text-mute)]">
        Open-tier data © respective Government of Kazakhstan &amp; providers · commercial entries link to provider docs.
      </p>
    </footer>
  );
}
