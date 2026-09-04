import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

/** Floating logo + nav — no header bar, no layout constraint. */
export default function Header() {
  return (
    <div className="site-chrome" aria-label="Site">
      <Link to="/" className="brand-lockup site-chrome-brand">
        <Logo />
      </Link>

      <nav className="site-chrome-nav" aria-label="Site navigation">
        <Link to="/mcp" className="site-chrome-link">
          MCP
        </Link>
        <Link to="/keys" className="site-chrome-link">
          Keys
        </Link>
      </nav>
    </div>
  );
}
