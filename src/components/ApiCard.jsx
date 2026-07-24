import { Link } from "react-router-dom";
import { useState } from "react";
import { CopyPasteTag, FreshnessBadge, TrustDot } from "./Badges.jsx";
import { isLiked, likeCount, toggleLike } from "../lib/likes.js";

export default function ApiCard({ api, onLikeChange }) {
  const [liked, setLiked] = useState(() => isLiked(api.id));
  const count = likeCount(api.id, api.likes || 0);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleLike(api.id);
    setLiked(next);
    onLikeChange?.();
  };

  return (
    <Link to={`/apis/${api.slug || api.id}`} className="card block p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <FreshnessBadge freshness={api.freshness} />
        <button
          type="button"
          className="heart rounded-md px-2 py-1 font-mono text-xs text-[var(--text-soft)]"
          onClick={handleLike}
          aria-pressed={liked}
        >
          {liked ? "♥" : "♡"} {count}
        </button>
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
