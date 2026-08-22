import { Link } from "react-router-dom";
import { CopyPasteTag, FreshnessBadge, TrustDot } from "./Badges.jsx";

export default function ApiCard({ api }) {
  return (
    <Link to={`/apis/${api.slug || api.id}`} className="card block p-4">
      <div className="mb-2">
        <FreshnessBadge freshness={api.freshness} />
      </div>

      <h3 className="text-base font-semibold leading-snug text-[var(--text)]">{api.title}</h3>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <TrustDot copyable={api.copyable} auth={api.auth} />
        <CopyPasteTag copyable={api.copyable} />
      </div>

      <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-[var(--text-mute)]">
        {api.category} · {api.group}
      </p>
    </Link>
  );
}
