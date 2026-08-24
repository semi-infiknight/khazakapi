import { Link } from "react-router-dom";
import { categoryLabel } from "../lib/categoryStyle.js";

export default function CatalogBrowseStrip({ categories }) {
  if (!categories?.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--text-mute)]">Browse by category</h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Category → company → API type → endpoint
          </p>
        </div>
      </div>
      <div className="service-browse-grid">
        {categories.slice(0, 12).map((category) => (
          <Link key={category.slug} to={`/browse/${category.slug}`} className="panel service-browse-card">
            <span className="service-browse-name">{categoryLabel(category.name)}</span>
            <span className="service-browse-meta">
              {category.count} APIs · {category.companyCount} companies · {category.typeCount} types
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
