/**
 * Full-height skeleton that reserves page space while async content loads,
 * preventing the footer from jumping up and snapping down.
 */
export function PageSkeleton({ variant = "detail", label }) {
  if (variant === "hub") {
    return (
      <div className="service-hub-layout container-main pb-16 pt-6" aria-hidden="true">
        <aside className="service-nav panel">
          <div className="service-nav-skeleton">
            <div className="skel-line skel-line-title" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skel-line skel-line-item" />
            ))}
          </div>
        </aside>
        <main className="service-main panel">
          <div className="service-main-skeleton">
            <div className="skel-breadcrumb" />
            <div className="skel-badges">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skel-chip" />
              ))}
            </div>
            <div className="skel-line skel-line-h1" />
            <div className="skel-line skel-line-desc" />
            <div className="skel-line skel-line-desc skel-line-short" />
            <div className="skel-block" />
            <div className="skel-block skel-block-tall" />
          </div>
        </main>
      </div>
    );
  }

  // detail
  return (
    <div className="container-main max-w-5xl py-8 pb-16" aria-hidden="true">
      <div className="skel-line skel-back" />
      <div className="skel-badges">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skel-chip" />
        ))}
      </div>
      <div className="skel-line skel-line-h1" />
      <div className="skel-line skel-line-desc" />
      <div className="skel-line skel-line-desc skel-line-short" />
      <div className="skel-block" />
      <div className="skel-block skel-block-tall" />
      <div className="skel-block" />
    </div>
  );
}

export default function LoadingState({ label = "Loading…", variant = "detail" }) {
  return (
    <>
      <PageSkeleton variant={variant} />
      <span className="sr-only">{label}</span>
    </>
  );
}
