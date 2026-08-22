import ApiCard from "./ApiCard.jsx";

export default function ApiGrid({ apis }) {
  if (!apis?.length) {
    return (
      <div className="hub-empty">
        <p>No APIs match your filters.</p>
      </div>
    );
  }

  return (
    <div className="hub-grid">
      {apis.map((api) => (
        <ApiCard key={api.id} api={api} />
      ))}
    </div>
  );
}
