import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function Header() {
  return (
    <header className="site-topbar">
      <div className="container-main site-topbar-inner">
        <Link to="/" className="brand-lockup site-topbar-brand">
          <Logo />
        </Link>

        <nav className="site-topbar-nav" aria-label="Site">
          <Link to="/mcp" className="site-topbar-link">
            MCP
          </Link>
          <Link to="/keys" className="site-topbar-link">
            Keys
          </Link>
        </nav>
      </div>
    </header>
  );
}
