import { Link } from "react-router-dom";

export default function SiteNavPanel({ onNavigate }) {
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
    </nav>
  );
}
