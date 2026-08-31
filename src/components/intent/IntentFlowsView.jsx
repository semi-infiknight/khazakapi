import { useMemo, useRef } from "react";
import FeatureApiCard from "./FeatureApiCard.jsx";
import PostmanFlowNode from "./PostmanFlowNode.jsx";
import { useFlowEdgePaths } from "./useFlowEdgePaths.js";
import { formatProductLabel } from "./intentShared.js";
import { useMobileLayout } from "../../hooks/useMediaQuery.js";

function FlowSvgEdges({ paths }) {
  if (!paths.length) return null;

  return (
    <svg className="intent-flows-svg" aria-hidden="true">
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          className={`intent-flows-edge intent-flows-edge--${path.tone}`}
          fill="none"
        />
      ))}
    </svg>
  );
}

export default function IntentFlowsView({ suggestion, blocks }) {
  const isMobile = useMobileLayout();
  const stageRef = useRef(null);
  const startRef = useRef(null);
  const featureRefs = useRef([]);
  const branchRefs = useRef([]);

  const edgePairs = useMemo(() => {
    const pairs = [];
    if (blocks.length) {
      pairs.push({
        getFrom: () => startRef.current,
        getTo: () => featureRefs.current[0],
        kind: "spine",
        tone: "start",
      });
    }
    blocks.forEach((block, index) => {
      if (index < blocks.length - 1) {
        pairs.push({
          getFrom: () => featureRefs.current[index],
          getTo: () => featureRefs.current[index + 1],
          kind: "spine",
          tone: "feature",
        });
      }
      pairs.push({
        getFrom: () => featureRefs.current[index],
        getTo: () => branchRefs.current[index],
        kind: "branch",
        tone: "api",
        fromPort: "success",
      });
    });
    return pairs;
  }, [blocks]);

  const paths = useFlowEdgePaths(stageRef, edgePairs, [blocks.length]);

  const apiCount = blocks.reduce((n, b) => n + b.apis.length, 0);
  const productLabel = formatProductLabel(suggestion?.query);

  return (
    <div className="intent-flows">
      <div className="intent-flows-toolbar">
        <span className="intent-flows-toolbar-label">Flows canvas</span>
        <span className="intent-flows-toolbar-meta">
          {blocks.length} features · {apiCount} APIs
        </span>
      </div>

      <div className="intent-flows-stage" ref={stageRef}>
        <FlowSvgEdges paths={paths} />

        <div className={`intent-flows-spine${isMobile ? " intent-flows-spine--stacked" : ""}`}>
          <div className="intent-flows-col intent-flows-col--start">
            <PostmanFlowNode
              nodeRef={startRef}
              type="start"
              title={productLabel}
              subtitle="Product"
              fields={[
                suggestion.summary ? { label: "Summary", value: suggestion.summary } : null,
              ].filter(Boolean)}
              showFailPort={false}
            />
          </div>

          {blocks.map((block, index) => (
            <div key={block.id} className="intent-flows-col">
              <PostmanFlowNode
                nodeRef={(el) => {
                  featureRefs.current[index] = el;
                }}
                type="feature"
                title={block.label}
                subtitle={block.parentLabel || "Feature layer"}
                fields={[
                  block.why ? { label: "Why", value: block.why } : null,
                  block.where ? { label: "Where", value: block.where, badge: "scope" } : null,
                  {
                    label: "APIs",
                    value: `${block.apis.length} matched`,
                    badge: `${block.apis.length}`,
                  },
                ].filter(Boolean)}
              />

              <div
                className="intent-flows-branch"
                ref={(el) => {
                  branchRefs.current[index] = el;
                }}
              >
                <p className="intent-flows-branch-kicker">
                  <span className="intent-flows-branch-dot intent-flows-branch-dot--success" />
                  Success branch · pick an API
                </p>
                <div className="intent-prompt-api-grid intent-flows-api-grid">
                  {block.apis.map((api) => (
                    <FeatureApiCard key={`${block.id}-${api.id}`} api={api} feature={block} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
