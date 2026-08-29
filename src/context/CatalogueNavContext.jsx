import { createContext, useContext, useMemo, useState } from "react";

const CatalogueNavContext = createContext(null);

export function CatalogueNavProvider({ children }) {
  const [catalogue, setCatalogue] = useState(null);
  const value = useMemo(() => ({ catalogue, setCatalogue }), [catalogue]);
  return <CatalogueNavContext.Provider value={value}>{children}</CatalogueNavContext.Provider>;
}

export function useCatalogueNav() {
  return useContext(CatalogueNavContext);
}
