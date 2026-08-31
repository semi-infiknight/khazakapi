import { Navigate } from "react-router-dom";

/** Legacy route — data.egov key setup now lives in the unified key manager. */
export default function EgovKeyPage() {
  return <Navigate to="/keys?provider=data.egov.kz" replace />;
}
