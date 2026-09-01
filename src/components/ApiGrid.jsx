import ApiCard from "./ApiCard.jsx";

export default function ApiGrid({ apis, stagger = false, staggerFrom = 0 }) {
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
