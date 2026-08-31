import { Link } from "react-router-dom";
import { shortApiLabel } from "./intentShared.js";

function FlowConnector() {
  return (
    <div className="intent-flows-connector" aria-hidden="true">
      <span className="intent-flows-connector-line" />
      <span className="intent-flows-connector-arrow">→</span>
    </div>
  );
}

function FlowPort({ side }) {
  return <span className={`intent-flows-port intent-flows-port--${side}`} aria-hidden="true" />;
}

function FlowBlock({ tone, label, meta, children, href }) {
  const body = (
    <>
      <FlowPort side="in" />
      <div className="intent-flows-block-inner">
        <span className={`intent-flows-block-stripe intent-flows-block-stripe--${tone}`} />
        <div className="intent-flows-block-copy">
          <span className="intent-flows-block-type">{tone}</span>
          <strong className="intent-flows-block-title">{label}</strong>
          {meta ? <span className="intent-flows-block-meta">{meta}</span> : null}
          {children}
        </div>
      </div>
      <FlowPort side="out" />
    </>
  );

  if (href) {
    return (
      <Link to={href} className={`intent-flows-block intent-flows-block--${tone}`}>
        {body}
      </Link>
    );
  }

  return <div className={`intent-flows-block intent-flows-block--${tone}`}>{body}</div>;
}

function apiHref(api) {
  return (
    api.plugIn?.href ||
    api.hubPath ||
    (api.companyHub && api.categorySlug && api.companySlug
      ? `/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`
      : `/apis/${api.slug || api.id}`)
  );
}

export default function IntentFlowsView({ suggestion, blocks }) {
  const nodes = [];

  nodes.push(
    <FlowBlock
      key="start"
      tone="start"
      label="Start"
      meta="Your product intent"
      children={<p className="intent-flows-block-note">“{suggestion.query}”</p>}
    />,
  );

  blocks.forEach((block) => {
    nodes.push(<FlowConnector key={`c-feature-${block.id}`} />);
    nodes.push(
      <FlowBlock
        key={`feature-${block.id}`}
        tone="feature"
        label={block.label}
        meta={block.parentLabel || "Feature layer"}
        children={block.where ? <p className="intent-flows-block-note">{block.where}</p> : null}
      />,
    );

    block.apis.forEach((api) => {
      nodes.push(<FlowConnector key={`c-api-${block.id}-${api.id}`} />);
      nodes.push(
        <FlowBlock
          key={`api-${block.id}-${api.id}`}
          tone="api"
          label={shortApiLabel(api.title)}
          meta={`${api.provider || api.companyName || "API"} · GET`}
          href={apiHref(api)}
          children={
            api.matchScore != null ? (
              <span className="intent-flows-block-score">Match {Math.round(api.matchScore * 100)}%</span>
            ) : null
          }
        />,
      );
    });

  });

  return (
    <div className="intent-flows">
      <div className="intent-flows-toolbar">
        <span className="intent-flows-toolbar-label">Postman-style flow</span>
        <span className="intent-flows-toolbar-meta">
          {blocks.length} features · {blocks.reduce((n, b) => n + b.apis.length, 0)} APIs
        </span>
      </div>
      <div className="intent-flows-canvas" role="img" aria-label="API integration flow canvas">
        <div className="intent-flows-track">{nodes}</div>
      </div>
    </div>
  );
}
