import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function Header() {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <div className="container-main flex min-h-14 items-center justify-between gap-3 py-2">
        <Link to="/" className="brand-lockup flex min-w-0 items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/mcp" className="hidden font-mono text-xs text-[var(--text-soft)] transition-colors duration-200 hover:text-[var(--text)] sm:inline">
            MCP
          </Link>
          <Link to="/keys" className="hidden font-mono text-xs text-[var(--text-soft)] transition-colors duration-200 hover:text-[var(--text)] sm:inline">
            Keys
          </Link>
        </div>
      </div>
    </header>
  );
}
