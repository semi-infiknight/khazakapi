import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { CatalogueNavProvider } from "../context/CatalogueNavContext.jsx";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const chromeLess = pathname === "/mcp" || pathname === "/setup/mcp";

  if (chromeLess) {
    return <div className="app-shell app-shell-mcp">{children}</div>;
  }

  return (
    <CatalogueNavProvider>
      <div className="app-shell">
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBottomNav />
      </div>
    </CatalogueNavProvider>
  );
}
