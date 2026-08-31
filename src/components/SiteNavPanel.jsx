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
        MCP
      </Link>
      <Link to="/keys" className="site-nav-panel-link" onClick={close}>
        Keys
      </Link>
      <button type="button" className="site-nav-panel-link site-nav-panel-link-btn" onClick={toggle}>
        Theme: {theme === "dark" ? "Light" : "Dark"}
      </button>
    </nav>
  );
}
