import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import IntentInputBar from "./IntentInputBar.jsx";
import { useCatalogueNav } from "../context/CatalogueNavContext.jsx";

function DockIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 4 4" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m7 7 10 10M17 7 7 17" />
      </svg>
    );
  }

  return null;
}

export default function MobileBottomNav() {
  const { catalogue } = useCatalogueNav();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    document.body.classList.add("catalogue-mobile-nav-active");
    return () => {
      document.body.classList.remove("catalogue-mobile-nav-active");
    };
  }, []);

  useEffect(() => {
    if (searchExpanded) {
      document.body.classList.add("catalogue-mobile-search-open");
    } else {
      document.body.classList.remove("catalogue-mobile-search-open");
    }
    return () => document.body.classList.remove("catalogue-mobile-search-open");
  }, [searchExpanded]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const syncBrowserChrome = () => {
      if (!viewport.height) {
        document.documentElement.style.setProperty("--browser-ui-offset", "0px");
        document.documentElement.style.setProperty("--viewport-offset-top", "0px");
        return;
      }

      const chrome = Math.max(0, window.innerHeight - viewport.offsetTop - viewport.height);
      const capped = Math.min(chrome, 120);
      document.documentElement.style.setProperty("--browser-ui-offset", `${capped}px`);
      document.documentElement.style.setProperty("--viewport-offset-top", `${viewport.offsetTop}px`);
    };

    syncBrowserChrome();
    viewport.addEventListener("resize", syncBrowserChrome);
    viewport.addEventListener("scroll", syncBrowserChrome);
    window.addEventListener("orientationchange", syncBrowserChrome);

    return () => {
      viewport.removeEventListener("resize", syncBrowserChrome);
      viewport.removeEventListener("scroll", syncBrowserChrome);
      window.removeEventListener("orientationchange", syncBrowserChrome);
      document.documentElement.style.removeProperty("--browser-ui-offset");
      document.documentElement.style.removeProperty("--viewport-offset-top");
    };
  }, []);

  useEffect(() => {
    const requested = location.state?.openPanel;
    if (!requested || location.pathname !== "/") return;
    if (requested === "search") {
      setSearchExpanded(true);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!searchExpanded) return undefined;
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    const onKey = (e) => {
      if (e.key === "Escape") setSearchExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchExpanded]);

  const openSearch = () => {
    if (catalogue) {
      setSearchExpanded(true);
      return;
    }
    navigate("/", { state: { openPanel: "search" } });
  };

  const closeSearch = () => setSearchExpanded(false);

  const nav = (
    <div className="catalogue-mobile-nav" aria-hidden={false}>
      <nav
        className={`catalogue-mobile-bar ${searchExpanded ? "catalogue-mobile-bar--search-open" : ""}`}
        aria-label="Mobile search"
      >
        <div className={`catalogue-mobile-search-slot ${searchExpanded ? "catalogue-mobile-search-slot--open" : ""}`}>
          {!searchExpanded ? (
            <button
              type="button"
              className="catalogue-mobile-bar-btn catalogue-mobile-search-trigger"
              aria-label="Search APIs"
              onClick={openSearch}
            >
              <span className="catalogue-mobile-bar-icon">
                <DockIcon name="search" />
              </span>
            </button>
          ) : (
            <div className="catalogue-mobile-search-field">
              <IntentInputBar
                variant="inline"
                inputRef={searchInputRef}
                value={catalogue?.query || ""}
                onChange={(next) => catalogue?.onQueryChange?.(next)}
                onSubmit={() => catalogue?.onIntentSubmit?.()}
                submitting={catalogue?.intentSubmitting}
                placeholder="Send a message…"
              />
              <button
                type="button"
                className="catalogue-mobile-search-close"
                aria-label="Close search"
                onClick={closeSearch}
              >
                <DockIcon name="close" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );

  return createPortal(nav, document.body);
}
