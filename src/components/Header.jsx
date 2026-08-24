import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useTheme } from "../hooks/useTheme.js";

export default function Header({ onMenuToggle, menuOpen }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
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
          <button
            type="button"
            className="btn-metal min-h-11 min-w-11 px-3"
            onClick={onMenuToggle}
            aria-expanded={menuOpen}
            aria-label="Navigation"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          role="menu"
          aria-label="Navigation"
          className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-2"
        >
          <Link to="/" className="block px-2 py-3 font-mono text-sm" onClick={onMenuToggle}>
            Directory
          </Link>
          <Link to="/mcp" className="block px-2 py-3 font-mono text-sm" onClick={onMenuToggle}>
            MCP server
          </Link>
          <Link to="/setup/data-egov-key" className="block px-2 py-3 font-mono text-sm" onClick={onMenuToggle}>
            data.egov key setup
          </Link>
          <a href="/api-docs.html" className="block px-2 py-3 font-mono text-sm" onClick={onMenuToggle}>
            API reference
          </a>
          <a href="/docs.html" className="block px-2 py-3 font-mono text-sm" onClick={onMenuToggle}>
            Docs
          </a>
          <a href="/api/catalogue" className="block px-2 py-3 font-mono text-sm" onClick={onMenuToggle}>
            REST catalogue
          </a>
          <a href="/api/mcp" className="block px-2 py-3 font-mono text-sm" onClick={onMenuToggle}>
            MCP JSON (/api/mcp)
          </a>
          <button type="button" className="block w-full px-2 py-3 text-left font-mono text-sm sm:hidden" onClick={toggle}>
            Theme: {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      )}
    </header>
  );
}
