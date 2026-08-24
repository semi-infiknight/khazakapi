import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchApi } from "../lib/api.js";

/** Redirect legacy /services/:slug/:id URLs to /browse/:category/:company/:id */
export default function ServiceRedirectPage() {
  const { serviceSlug, apiId } = useParams();
  const [target, setTarget] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiId) {
      setTarget(`/browse`);
      return;
    }
    fetchApi(apiId)
      .then((api) => {
        if (api.hubPath) setTarget(api.hubPath);
        else if (api.categorySlug && api.companySlug) {
          setTarget(`/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`);
        } else {
          setTarget(`/apis/${api.slug || api.id}`);
        }
      })
      .catch((e) => setError(e.message));
  }, [apiId, serviceSlug]);

  if (error) return <Navigate to="/" replace />;
  if (target) return <Navigate to={target} replace />;
  return <div className="container-main py-10 font-mono text-sm text-[var(--text-soft)]">Redirecting…</div>;
}
