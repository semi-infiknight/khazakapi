import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { useState } from "react";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
