import { categoryLabel } from "../lib/categoryStyle.js";

export default function CatalogBrowseStrip({ categories, activeCategory, onCategoryChange }) {
  if (!categories?.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--text-mute)]">Filter by category</h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">Tap a category to filter the catalogue below</p>
        </div>
      </div>
      <div className="service-browse-grid">
        {categories.slice(0, 12).map((category) => (
          <button
            key={category.slug}
            type="button"
            className={`panel service-browse-card ${activeCategory === category.name ? "service-browse-card-active" : ""}`}
            onClick={() => onCategoryChange?.(activeCategory === category.name ? "" : category.name)}
          >
            <span className="service-browse-name">{categoryLabel(category.name)}</span>
            <span className="service-browse-meta">
              {category.count} APIs · {category.companyCount} companies · {category.typeCount} types
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
