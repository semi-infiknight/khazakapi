import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCategory } from "../lib/api.js";
import { categoryLabel } from "../lib/categoryStyle.js";

export default function CategoryBrowsePage() {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    fetchCategory(categorySlug)
      .then(setCategory)
      .catch((e) => setError(e.message));
  }, [categorySlug]);

  if (error) {
    return (
      <div className="container-main py-10">
        <p className="text-[var(--red)]">{error}</p>
        <Link to="/" className="mt-4 inline-block font-mono text-sm text-[var(--accent)]">
          ← back to catalogue
        </Link>
      </div>
    );
  }

  if (!category) {
    return <div className="container-main py-10 font-mono text-sm text-[var(--text-soft)]">Loading category…</div>;
  }

  return (
    <div className="container-main pb-16 pt-6">
      <nav className="service-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="service-breadcrumb-link">
          Catalogue
        </Link>
        <span className="service-breadcrumb-sep">/</span>
        <span className="service-breadcrumb-current">{categoryLabel(category.name)}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold">{categoryLabel(category.name)}</h1>
      <p className="mt-2 text-sm text-[var(--text-soft)]">
        {category.count} APIs · {category.companyCount} companies · pick a provider to browse API types
      </p>

      <div className="service-browse-grid mt-8">
        {category.companies.map((company) => (
          <Link
            key={company.slug}
            to={`/browse/${category.slug}/${company.slug}`}
            className="panel service-browse-card"
          >
            <span className="service-browse-name">{company.name}</span>
            <span className="service-browse-meta">
              {company.count} APIs · {company.typeCount} types
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
