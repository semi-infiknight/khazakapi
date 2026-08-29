import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useTheme } from "../hooks/useTheme.js";

export default function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="site-header sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <div className="container-main flex min-h-14 items-center justify-between gap-3 py-2">
        <Link to="/" className="brand-lockup flex min-w-0 items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          <button type="button" className="btn-metal hidden sm:inline-flex" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <Link to="/mcp" className="hidden font-mono text-xs text-[var(--text-soft)] hover:text-[var(--text)] sm:inline">
            MCP server
          </Link>
          <Link to="/setup/data-egov-key" className="hidden font-mono text-xs text-[var(--text-soft)] hover:text-[var(--text)] sm:inline">
            data.egov key
          </Link>
          <a href="/api-docs.html" className="hidden font-mono text-xs text-[var(--text-soft)] hover:text-[var(--text)] sm:inline">
            Reference
          </a>
          <a href="/docs.html" className="hidden font-mono text-xs text-[var(--text-soft)] hover:text-[var(--text)] sm:inline">
            Docs
          </a>
        </div>
      </div>
    </header>
  );
}
