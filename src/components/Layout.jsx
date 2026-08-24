import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const chromeLess = pathname === "/mcp" || pathname === "/setup/mcp";

  if (chromeLess) {
    return <div className="app-shell app-shell-mcp">{children}</div>;
  }

  return (
    <div className="app-shell">
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
