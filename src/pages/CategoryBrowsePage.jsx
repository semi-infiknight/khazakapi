import { Navigate } from "react-router-dom";

/** Legacy /browse/:slug URLs redirect to the intent-driven catalogue home. */
export default function CategoryBrowsePage() {
  return <Navigate to="/" replace />;
}
