import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { categoryLabel } from "../lib/categoryStyle.js";

function GroupSection({ group, browsePath, query, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const endpoints = useMemo(() => {
    if (!query.trim()) return group.endpoints;
    const q = query.toLowerCase();
    return group.endpoints.filter(
      (ep) =>
        ep.label.toLowerCase().includes(q) ||
        ep.title.toLowerCase().includes(q) ||
        ep.id.toLowerCase().includes(q) ||
        (ep.apiType || "").toLowerCase().includes(q)
    );
  }, [group.endpoints, query]);

  if (!endpoints.length) return null;

  return (
    <div className="service-nav-group">
      <button type="button" className="service-nav-group-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="service-nav-group-chevron">{open ? "▾" : "▸"}</span>
        <span className="service-nav-group-name">{group.name}</span>
        <span className="service-nav-group-count">{endpoints.length}</span>
      </button>
      {open && (
        <nav className="service-nav-endpoints">
          {endpoints.map((ep) => (
            <NavLink
              key={ep.id}
              to={`${browsePath}/${ep.slug || ep.id}`}
              className={({ isActive }) => `service-nav-endpoint ${isActive ? "service-nav-endpoint-active" : ""}`}
            >
              <span className="service-nav-method">{ep.method || "GET"}</span>
              <span className="service-nav-endpoint-label">{ep.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}

export default function CompanyEndpointNav({ hub, endpointQuery = "" }) {
  const [query, setQuery] = useState("");
  const combinedQuery = endpointQuery || query;
  const browsePath = `/browse/${hub.category.slug}/${hub.company.slug}`;

  const visibleGroups = useMemo(() => {
    if (!combinedQuery.trim()) return hub.groups;
    const q = combinedQuery.toLowerCase();
    return hub.groups
      .map((group) => ({
        ...group,
        endpoints: group.endpoints.filter(
          (ep) =>
            ep.label.toLowerCase().includes(q) ||
            ep.title.toLowerCase().includes(q) ||
            ep.id.toLowerCase().includes(q) ||
            group.name.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.endpoints.length);
  }, [hub.groups, combinedQuery]);

  return (
    <aside className="panel service-nav">
      <div className="service-nav-header">
        <Link to="/" className="service-nav-back">
          ← Catalogue
        </Link>
        <Link to="/" state={{ category: hub.category.name }} className="service-nav-back mt-1 inline-block">
          ← {categoryLabel(hub.category.name)}
        </Link>
        <h1 className="service-nav-title">{hub.company.name}</h1>
        <p className="service-nav-meta">
          {hub.company.provider} · {hub.count} APIs · {hub.groupCount} types
        </p>
      </div>

      <div className="service-nav-search-wrap">
        <input
          type="search"
          className="search-input service-nav-search"
          placeholder="Search endpoints…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search endpoints in this company hub"
        />
      </div>

      <div className="service-nav-groups">
        {visibleGroups.map((group, index) => (
          <GroupSection
            key={group.slug || group.name}
            group={group}
            browsePath={browsePath}
            query={combinedQuery}
            defaultOpen={index < 4 || Boolean(combinedQuery.trim())}
          />
        ))}
        {!visibleGroups.length && (
          <p className="service-nav-empty font-mono text-xs text-[var(--text-mute)]">No endpoints match your search.</p>
        )}
      </div>
    </aside>
  );
}
