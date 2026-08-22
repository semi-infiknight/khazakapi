import ApiCard from "./ApiCard.jsx";

export default function ApiGrid({ apis }) {
  if (!apis?.length) {
    return (
      <div className="panel p-8 text-center">
        <p className="font-mono text-sm text-[var(--text-soft)]">No APIs match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {apis.map((api) => (
        <ApiCard key={api.id} api={api} />
      ))}
    </div>
  );
}
