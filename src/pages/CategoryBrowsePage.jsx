import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCategory } from "../lib/api.js";

/** Legacy /browse/:slug URLs redirect to home with an in-page category filter. */
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

  return <Navigate to="/" replace state={{ category: category.name }} />;
}
