import ApiCard from "./ApiCard.jsx";

const SKELETON_COUNT = 6;

function SkeletonCard() {
  return (
    <div className="card api-card api-card-skeleton" aria-hidden="true">
      <div className="api-card-body">
        <div className="api-card-skeleton-logo" />
        <div className="api-card-copy">
          <div className="api-card-skeleton-line api-card-skeleton-title" />
          <div className="api-card-skeleton-line api-card-skeleton-desc" />
          <div className="api-card-skeleton-line api-card-skeleton-desc" />
        </div>
      </div>
      <div className="api-card-metrics">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="api-card-skeleton-pill" />
        ))}
      </div>
    </div>
  );
}

export default function ApiGrid({ apis, stagger = false, staggerFrom = 0, skeleton = 0 }) {
  if (skeleton > 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: skeleton }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!apis?.length) {
    return (
      <div className="panel p-8 text-center catalogue-content-enter">
        <p className="font-mono text-sm text-[var(--text-soft)]">No APIs match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {apis.map((api, index) => (
        <ApiCard
          key={api.id}
          api={api}
          enter={stagger && index >= staggerFrom}
          stagger={stagger ? Math.min(index - staggerFrom, 14) : undefined}
        />
      ))}
    </div>
  );
}

export { SKELETON_COUNT };
