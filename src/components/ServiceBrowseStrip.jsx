import { Link } from "react-router-dom";

export default function ServiceBrowseStrip({ services }) {
  if (!services?.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--text-mute)]">Browse by service</h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">RapidAPI-style grouping — pick a service, then an endpoint.</p>
        </div>
      </div>
      <div className="service-browse-grid">
        {services.slice(0, 12).map((service) => (
          <Link key={service.slug} to={`/services/${service.slug}`} className="panel service-browse-card">
            <span className="service-browse-name">{service.name}</span>
            <span className="service-browse-meta">
              {service.count} endpoints · {service.categoryCount} groups
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
