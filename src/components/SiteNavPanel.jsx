import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme.js";

export default function SiteNavPanel({ onNavigate }) {
  const { theme, toggle } = useTheme();
  const close = onNavigate || (() => {});

  return (
    <nav className="site-nav-panel" aria-label="Site">
      <Link to="/" className="site-nav-panel-link" onClick={close}>
        Directory
      </Link>
      <Link to="/mcp" className="site-nav-panel-link" onClick={close}>
        MCP server
      </Link>
      <Link to="/setup/data-egov-key" className="site-nav-panel-link" onClick={close}>
        data.egov key setup
      </Link>
      <a href="/api-docs.html" className="site-nav-panel-link" onClick={close}>
        API reference
      </a>
      <a href="/docs.html" className="site-nav-panel-link" onClick={close}>
        Docs
      </a>
      <a href="/api/catalogue" className="site-nav-panel-link" onClick={close}>
        REST catalogue
      </a>
      <a href="/api/mcp" className="site-nav-panel-link" onClick={close}>
        MCP JSON (/api/mcp)
      </a>
      <button type="button" className="site-nav-panel-link site-nav-panel-link-btn" onClick={toggle}>
        Theme: {theme === "dark" ? "Light" : "Dark"}
      </button>
    </nav>
  );
}
